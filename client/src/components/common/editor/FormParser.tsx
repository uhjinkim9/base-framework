"use client";
import styles from "./styles/FormParser.module.scss";
import React, {
	ChangeEvent,
	ReactNode,
	useEffect,
	useState,
	forwardRef,
} from "react";
import parse, {Element} from "html-react-parser";

import {convertColwidthToStyle} from "@/components/src/admin/etc/tiptap-convert-standard-style";
import {fullDateWithLabel} from "@/util/helpers/formatters";

import {valueMapExample} from "./etc/options";
import {MetaFieldType} from "./etc/editor.type";
import {UserErpType} from "@/types/user.type";

/**
 * @module FormParser
 * @description
 * - 양식 HTML을 파싱하고 사용자 데이터로 치환하여 렌더링
 * - 미리보기 시 예시 데이터로 치환
 *
 * @author 김어진
 * @updated 2025-09-08
 */

type Props = {
	htmlString: string;
	isExample?: boolean;
	getFormData?: () => FormDataMap;
	generateFinalHtml?: () => string;
	formFields?: MetaFieldType[];
	metaFieldsData?: Partial<UserErpType> | null; // ERP 정보
	onFormDataChange?: (formData: FormDataMap) => void;
};

type FormDataMap = {
	[key: string]: string;
};

const FormParser = forwardRef<HTMLDivElement, Props>(
	(
		{
			htmlString,
			isExample = false,
			getFormData,
			generateFinalHtml,
			formFields = [],
			metaFieldsData = null,
			onFormDataChange,
		},
		ref
	) => {
		const [formData, setFormData] = useState<FormDataMap>({});

		// formFields 초기 데이터를 formData에 설정
		useEffect(() => {
			if (formFields.length > 0) {
				const initialData: FormDataMap = {};
				formFields.forEach((field) => {
					if (
						field.id &&
						(field.type === "input" || field.type === "select")
					) {
						// input/select 타입은 항상 빈 문자열로 초기화
						// field.value가 필드 ID와 같다면 빈 문자열 사용
						const isFieldIdAsValue = field.value === field.id;
						initialData[field.id] = isFieldIdAsValue
							? ""
							: field.value || "";
					}
				});

				// 기존 formData와 다를 때만 업데이트
				setFormData((prev) => {
					const hasChanges = Object.keys(initialData).some(
						(key) => prev[key] !== initialData[key]
					);
					return hasChanges ? initialData : prev;
				});
			}
		}, [formFields]);

		// formData가 변경될 때 부모에게 알림 (별도 useEffect로 분리)
		useEffect(() => {
			onFormDataChange?.(formData);
		}, [formData]);

		// 입력 값 변경 핸들러
		const handleChange = (name: string, value: string) => {
			// name을 통해 fieldId를 찾기 (역방향 매핑)
			const matchedField = formFields.find((f) => f.name === name);
			const fieldKey = matchedField?.id || name;

			setFormData((prev) => ({
				...prev,
				[fieldKey]: value,
			}));
		};

		// 외부로 formData 노출
		useEffect(() => {
			if (getFormData) {
				getFormData = () => formData;
			}
		}, [formData, getFormData]);

		// 최종 HTML 생성 함수
		const generateFinalFormHtml = () => {
			let finalHtml = convertedHtml;

			// formData의 값들로 치환
			Object.keys(formData).forEach((key) => {
				const value = formData[key];
				// render-element를 실제 값으로 치환
				const regex = new RegExp(
					`<render-element[^>]*data-id="${key}"[^>]*>[^<]*</render-element>`,
					"g"
				);
				finalHtml = finalHtml.replace(regex, value);
			});

			return finalHtml;
		};

		// 외부로 최종 HTML 생성 함수 노출
		useEffect(() => {
			if (generateFinalHtml) {
				generateFinalHtml = generateFinalFormHtml;
			}
		}, [formData, generateFinalHtml]);

		// metaFieldsData가 준비된 후에만 치환
		const getReplacedHtml = () => {
			let map: Record<string, string> = {};
			if (isExample) {
				map = valueMapExample;
			} else if (metaFieldsData && typeof metaFieldsData === "object") {
				Object.entries(metaFieldsData).forEach(([key, value]) => {
					map[`##${key}##`] = String(value ?? "");
				});
			}

			// 현재 시각 추가
			map["##submitted-date##"] = fullDateWithLabel(new Date());

			let replaced = htmlString;
			Object.keys(map).forEach((key) => {
				replaced = replaced.replaceAll(key, map[key] ?? "");
			});
			return replaced;
		};

		const replacedHtml = getReplacedHtml();
		const convertedHtml = convertColwidthToStyle(replacedHtml);

		const convertTypeToTag = (
			type: string,
			fieldId: string,
			elementAttribs?: any
		): ReactNode => {
			// formFields에서 data-id가 일치하는 필드 찾기
			const matchedField = formFields.find((f) => f.id === fieldId);

			// 매칭된 필드가 있으면 해당 필드의 name 사용, 없으면 fieldId
			const fieldName = matchedField?.name || fieldId;
			const fieldPlaceholder = matchedField?.placeholder || "";
			const fieldRequired = matchedField?.isRequired || false;

			// HTML 속성에서 추가 필드 정보 추출 (fallback)
			let placeholder = fieldPlaceholder;
			let isRequired = fieldRequired;

			try {
				const props = JSON.parse(
					elementAttribs?.["data-props"] || "{}"
				);
				placeholder = placeholder || props.placeholder || "";
				isRequired = isRequired || props.required || false;
			} catch {}

			switch (type) {
				case "input":
					return (
						<>
							<input
								type="text"
								name={fieldName}
								placeholder={placeholder}
								onChange={(e: ChangeEvent<HTMLInputElement>) =>
									handleChange(e.target.name, e.target.value)
								}
							/>
							<span className={isRequired ? styles.required : ""}>
								*
							</span>
						</>
					);
				case "select":
					return (
						<select
							name={fieldName}
							required={isRequired}
							onChange={(e: ChangeEvent<HTMLSelectElement>) =>
								handleChange(e.target.name, e.target.value)
							}
						>
							{/* options는 matchedField.options에서 파싱 가능 */}
							<option value="">선택하세요</option>
							{/* TODO: matchedField.options를 파싱해서 option들 렌더링 */}
						</select>
					);
				default:
					return <span>{type}</span>;
			}
		};
		const parsed = convertedHtml
			? parse(convertedHtml, {
					replace: (domNode) => {
						if (
							domNode.type === "tag" &&
							domNode.name === "span" &&
							(domNode as Element).attribs &&
							(domNode as Element).attribs[
								"data-generated-element"
							] === "true"
						) {
							const el = domNode as Element;
						}

						if (
							domNode.type === "tag" &&
							domNode.name === "render-element" &&
							(domNode as Element).attribs
						) {
							const el = domNode as Element;
							const type = el.attribs["data-element-type"];

							let dataId = "";
							try {
								const props = JSON.parse(
									el.attribs["data-props"] || "{}"
								);
								dataId = props["data-id"] || "";
							} catch {}

							if (isExample) {
								// 미리보기 모드: valueMapExample 값 표시
								if (type && valueMapExample[type]) {
									return (
										<span
											{...el.attribs}
											data-generated-element="true"
											data-element-type={type}
											data-id={dataId}
										>
											{valueMapExample[type]}
										</span>
									);
								}
								return (
									<span
										data-generated-element="true"
										data-element-type={type}
										data-id={dataId}
									>
										{type}
									</span>
								);
							} else {
								// 실제 입력 모드: 실제 HTML 요소 렌더링
								const node = convertTypeToTag(
									type,
									dataId,
									el.attribs
								);

								return (
									<span
										{...el.attribs}
										data-generated-element="true"
										data-element-type={type}
										data-id={dataId}
									>
										{node}
									</span>
								);
							}
						}
						return undefined;
					},
			  })
			: null;

		// console.log("TODO: pdf 레이아웃 조정", parsed);

		return (
			<section className={styles.wrapper}>
				<div className={styles.container} ref={ref}>
					{parsed}
				</div>
			</section>
		);
	}
);

FormParser.displayName = "FormParser";

export default FormParser;
