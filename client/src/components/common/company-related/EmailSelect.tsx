"use client";
import styles from "./styles/EmailSelect.module.scss";
import {useEffect, useMemo, useState} from "react";

import {isEmpty} from "@/util/validators/check-empty";
import {externalPost} from "@/util/api/api-service";
import {DeptType, EmpType, OrgTreeType} from "./types/organization.type";

import useModal from "@/hooks/useModal";
import Modal from "../layout/Modal";
import InputBasic from "../form-properties/InputBasic";
import ButtonBasic from "../form-properties/ButtonBasic";
import EmpEmailSelectTreeNode from "./part/EmailSelectTreeNode";
import EmailSelectFilteredResult from "./part/EmailSelectFilteredResult";

export default function EmailSelect({
	onChange,
	multi = false,
	buttonLabel = "조직도",
	name = "emails",
	value,
	label = "",
	width,
	placeHolder = "성명",
}: {
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	multi?: boolean;
	buttonLabel?: string;
	inputLabel?: string;
	name?: string;
	value?: string;
	label?: string;
	width?: string;
	placeHolder?: string;
}) {
	// ERP에서 가져온 데이터 세팅 상태
	const [lists, setLists] = useState<{
		deptList: DeptType[];
		empList: EmpType[];
	}>({
		deptList: [],
		empList: [],
	});
	const empList = lists?.empList || [];
	const deptList = lists?.deptList || [];

	const [expanded, setExpanded] = useState<Record<string, boolean>>({
		"0000": true,
	});
	const [searchWord, setSearchWord] = useState("");
	const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
	const {openModal, closeModal, modalConfig} = useModal();

	useEffect(() => {
		console.log("selectedTargets", selectedTargets);
	}, [selectedTargets]);

	// 초기화 여부를 확인하기 위한 useRef
	// 컴포넌트가 처음 렌더링될 때만 하는 초기화
	useEffect(() => {
		if (!value || empList.length === 0) return;

		// 이미 초기화된 상태라면 중복 실행 방지
		if (selectedTargets.length > 0) return;

		// 초기 세팅용 value 파싱(email,email,...)
		const userEmails = value.split(",");

		setSelectedTargets(userEmails);
	}, [empList, value]);

	async function getOrgTreeData() {
		const res = await externalPost("/apiKey/hr/erpOrgTree.do");
		if (res?.data) setLists(res.data);
	}

	useEffect(() => {
		buildTree();
	}, [lists]);

	useEffect(() => {
		getOrgTreeData();
	}, []);

	function toggle(deptCd: string) {
		setExpanded((prev) => ({
			...prev,
			[deptCd]: !prev[deptCd],
		}));
	}

	function handleSelect(payload: any) {
		// 부서 선택 처리: 해당 부서(및 하위 부서)의 모든 직원 이메일 추가
		if (payload?.deptCd && !payload?.email) {
			const rootDeptCd = payload.deptCd as string;
			const collectDeptCds = (root: string): Set<string> => {
				const set = new Set<string>(); // 결과 집합
				const q: string[] = [root]; // 탐색 대기열(큐)

				while (q.length) {
					const cur = q.shift() as string; // 큐 맨 앞 꺼내기
					if (set.has(cur)) continue; // 이미 방문한 부서면 스킵
					set.add(cur); // 현재 부서 기록

					// 현재 부서의 하위 부서들 찾기
					const children = deptList.filter(
						(d) => d.upperDeptCd === cur
					);
					children.forEach((c) => c.deptCd && q.push(c.deptCd)); // 큐에 추가
				}
				return set;
			};

			const deptSet = collectDeptCds(rootDeptCd);
			const deptEmails = empList
				.filter(
					(emp) =>
						emp.email &&
						emp.deptCd &&
						deptSet.has(emp.deptCd) &&
						emp.empType !== "6"
				)
				.map((emp) => emp.email as string);

			if (multi) {
				const uniq = Array.from(
					new Set([...selectedTargets, ...deptEmails])
				);
				setSelectedTargets(uniq);
				triggerOnChange(name, {emails: uniq});
			} else {
				const first = deptEmails[0] ? [deptEmails[0]] : [];
				setSelectedTargets(first);
				triggerOnChange(name, {emails: first});
			}

			setSearchWord("");
			return;
		}
		// 중복 방지
		if (multi && selectedTargets.find((t) => t === payload.email)) return;

		// 공통 처리
		const updated = multi
			? [...selectedTargets, payload.email]
			: [payload.email];
		setSelectedTargets(updated);

		triggerOnChange(name, {
			emails: updated,
		});

		// 검색 칸 초기화
		setSearchWord("");
	}

	// 상위 컴포넌트의 prop인 onChange 발동
	const triggerOnChange = (name: string, val: any) => {
		// 문자열 합치기 로직을 내부에서 처리
		const enhancedVal = {
			...val,
			[name]: val.emails?.join(",") || "",
		};

		const fakeEvent = {
			target: {name, value: enhancedVal},
		} as unknown as React.ChangeEvent<HTMLInputElement> & {
			target: {
				name: string;
				value: {
					emails: string[];
				};
			};
		};
		onChange?.(fakeEvent);
	};

	function removeSelected(email: string) {
		const updated = selectedTargets.filter((t) => t !== email);
		setSelectedTargets(updated);

		triggerOnChange(name, {
			emails: updated,
		});
	}

	const handleEnter = () => {
		const word = searchWord.trim();
		if (!word) return;

		// 이메일 형식이면 바로 선택 추가
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (emailRegex.test(word)) {
			if (multi && selectedTargets.includes(word)) {
				setSearchWord("");
				return;
			}
			handleSelect({email: word});
			setSearchWord("");
			return;
		}

		// 검색어 필터링
		const matchedEmps = empList.filter((emp) => emp.korNm?.includes(word));

		// 검색된 이름이 하나인 경우 바로 선택
		if (matchedEmps.length === 1) {
			handleSelect(matchedEmps[0]);
			setSearchWord("");
		} else {
			openModal();
		}
	};

	const handleBackspace = () => {
		if (searchWord !== "") return;

		const last = selectedTargets.at(-1);
		if (!last) return;

		const updated = selectedTargets.slice(0, -1);
		setSelectedTargets(updated);

		triggerOnChange(name, {
			emails: updated,
		});
	};

	function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Enter") {
			handleEnter();
		} else if (e.key === "Backspace") {
			handleBackspace();
		}
	}

	const treeRepeater = (list: DeptType[]): OrgTreeType[] => {
		const tree = list.map((dept) => {
			const emps = empList.filter(
				(emp) => dept.deptCd === emp.deptCd && emp.empType !== "6"
			);

			return {
				deptCd: dept.deptCd,
				deptNm: dept.deptNm,
				upperDeptCd: dept.upperDeptCd,
				mngEmpNo: dept.mngEmpNo,
				emps: emps,
				children: children(dept.deptCd || ""),
			} as OrgTreeType;
		});
		return tree;
	};

	function children(upperCd: string): OrgTreeType[] {
		const levelDepts = deptList.filter(
			(dept) => dept.upperDeptCd === upperCd
		);
		const tree = treeRepeater(levelDepts);
		return tree;
	}

	const buildTree = (): OrgTreeType[] => {
		const topNodes = lists.deptList.filter((dept) =>
			isEmpty(dept.upperDeptCd)
		);
		return treeRepeater(topNodes);
	};

	const filteredList = useMemo(() => {
		// 검색어가 2자 미만이면 필터링하지 않음
		if (searchWord.length < 2) return [];
		return empList.filter(
			// 검색 대상 필드들을 배열로 만들고, 일부라도 포함되면 true
			(emp) =>
				[emp.korNm, emp.deptNm, emp.jobGroupNm] // null 가능성 있음
					.filter(Boolean) // undefined, null 제거
					.some((field) => field?.includes(searchWord)) // 하나라도 포함되면 OK
		);
	}, [empList, searchWord]);

	const grouped = useMemo(() => {
		const groups = new Map<string, EmpType[]>();
		filteredList.forEach((emp) => {
			const key = emp.deptCd ?? "noDeptCd";

			// .set(): Map에 새로운 키-값 쌍을 추가하거나, 이미 있는 키의 값을 업데이트
			if (!groups.has(key)) groups.set(key, []);
			groups.get(key)?.push(emp);
		});
		return groups;
	}, [filteredList]);

	const searchInput =
		multi || selectedTargets.length === 0 ? (
			<InputBasic
				onChange={(e: any) => {
					const raw = e.target.value;
					const word = /^[a-zA-Z]+$/.test(raw)
						? raw.toUpperCase()
						: raw;
					setSearchWord(word);
				}}
				onKeyDown={handleKeyDown}
				name="searchWord"
				value={searchWord}
				placeholder={placeHolder}
			/>
		) : null;

	const clearSearchWord = (
		<span onClick={() => setSearchWord("")} className={styles.closeButton}>
			×
		</span>
	);

	const getEmployeeDisplayName = (email: string): string => {
		// 정규식에 맞는 이메일이면 그대로 반환
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (emailRegex.test(email)) {
			// 직원 목록에서 해당 이메일을 가진 직원 찾기
			const employee = empList.find((emp) => emp.email === email);
			if (
				employee &&
				employee.korNm &&
				employee.posNm &&
				employee.deptNm
			) {
				return `${employee.korNm} ${employee.posNm} / ${employee.deptNm} / ${email}`;
			}
		}
		// 직원이 아니거나 정보가 불완전하면 이메일만 반환
		return email;
	};

	const RemoveTargetButton = (email: string) => (
		<span
			onClick={() => removeSelected(email)}
			className={styles.closeButton}
		>
			×
		</span>
	);

	return (
		<div className={styles.container} style={{width: width}}>
			<div className={styles.searchedEmps}>
				{label && <span className={styles.label}>{label}</span>}
				{selectedTargets.map((target, idx) => (
					<div key={idx} className={styles.selectedItem}>
						<span className={styles.span}>
							{getEmployeeDisplayName(target)}
						</span>
						<span
							className={styles.closeButton}
							onClick={() => removeSelected(target)}
						>
							×
						</span>
					</div>
				))}
				{searchInput}
				{(multi || selectedTargets.length === 0) && (
					<ButtonBasic
						onClick={openModal}
						width="3.5rem"
						onHoverOpaque
					>
						{buttonLabel}
					</ButtonBasic>
				)}
			</div>

			<Modal
				closeModal={closeModal}
				modalConfig={modalConfig}
				width="30vw"
				height="55vh"
			>
				<div className={styles.treeContainer}>
					<div className={styles.treeWrapper}>
						<div className={styles.searchInput}>
							{searchInput}
							{clearSearchWord}
						</div>

						{isEmpty(searchWord) ? (
							buildTree().map((node) => (
								<EmpEmailSelectTreeNode
									key={node.deptCd}
									node={node}
									level={0}
									expanded={expanded}
									toggle={toggle}
									selectedTargets={selectedTargets}
									onSelect={handleSelect}
								/>
							))
						) : (
							<EmailSelectFilteredResult
								grouped={grouped}
								onSelect={handleSelect}
							/>
						)}
					</div>

					{multi && (
						<div className={styles.empsWapper}>
							<div className={styles.selectedEmpsWrapper}>
								<div className={styles.selectedEmpWrapper}>
									{selectedTargets.map((target, idx) => (
										<div
											key={idx}
											className={styles.selectedEmps}
										>
											{getEmployeeDisplayName(target)}
											{RemoveTargetButton(target)}
										</div>
									))}
								</div>
							</div>
						</div>
					)}
				</div>
			</Modal>
		</div>
	);
}
