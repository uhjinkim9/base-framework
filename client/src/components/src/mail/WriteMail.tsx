"use client";
import styles from "./styles/WriteMail.module.scss";
import clsx from "clsx";
import {usePathname, useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {motion} from "framer-motion";

import {useMailContext} from "@/context/MailContext";
import {MailType, RecipientTypeEnum} from "@/types/mail.type";

import {requestPost} from "@/util/api/api-service";
import {saveLastUrl} from "@/util/common/last-url";

import IconNode from "@/components/common/segment/IconNode";
import MailHeaderBtnGroup from "./inner/MailHeaderBtnGroup";
import InputBasic from "@/components/common/form-properties/InputBasic";
import TextEditor from "@/components/common/editor/TextEditor";
import FileDrop from "@/components/common/editor/parts/FileDrop";
import CommonButtonGroup from "@/components/common/segment/CommonButtonGroup";
import EmpEmailSelect from "@/components/common/company-related/EmailSelect";
import Tooltip from "@/components/common/segment/Tooltip";
import CheckIconBox from "@/components/common/form-properties/CheckIconBox";

export default function WriteMail({mailIdx}: {mailIdx?: number}) {
	const router = useRouter();
	const pathname = usePathname();
	const [_, mainMenu, subMenu, leafMenu] = pathname.split("/"); // mainMenu: mail, subMenu: proof

	// const [expanded, setExpanded] = useState<Record<string, boolean>>({
	// 	[RecipientTypeEnum.CC]: false,
	// 	[RecipientTypeEnum.BCC]: false,
	// });
	const [expanded, setExpanded] = useState<boolean>(false);
	const [mail, setMail] = useState<MailType | null>(null);
	const toRecipients = mail?.recipients?.filter(
		(r) => r.type === RecipientTypeEnum.TO
	);
	const ccRecipients = mail?.recipients?.filter(
		(r) => r.type === RecipientTypeEnum.CC
	);
	const bccRecipients = mail?.recipients?.filter(
		(r) => r.type === RecipientTypeEnum.BCC
	);

	useEffect(() => {
		getMail();
		console.log("mailIdx", mailIdx);
	}, [mailIdx]);

	const getMail = async () => {
		const res = await requestPost("/mail/getMail", {mailIdx});
		if (res.statusCode === 200) {
			setMail(res.data);
			console.log("MailView: ", res.data);
		}
	};

	const handleExpansion = (type: RecipientTypeEnum) => {
		// setExpanded((prev) => ({
		// 	...prev,
		// 	[type]: !prev[type],
		// }));
		setExpanded((prev) => !prev);
	};

	return (
		<>
			<div className={styles.mailViewContainer}>
				<MailHeaderBtnGroup />

				<div className={styles.mailInfo}>
					<span className={styles.title}>
						<Tooltip text="중요 메일">
							<CheckIconBox
								componentType="exclamation"
								value={mail?.isImportant}
								onChange={(e) => {
									setMail((prev) => ({
										...prev,
										isImportant: e.target.checked,
									}));
								}}
							/>
						</Tooltip>
						<InputBasic
							name="subject"
							value={mail?.subject}
							placeholder="제목 입력"
							width="99%"
							noPadding
						/>
					</span>

					<div className={styles.recipients}>
						<div className={styles.emails}>
							<span className={styles.label}>수신</span>
							<EmpEmailSelect multi />
						</div>

						<div className={styles.emails}>
							<span className={styles.label}>
								참조
								<motion.div
									animate={{
										rotate: expanded ? 180 : 0,
									}}
									transition={{
										duration: 0.3,
										ease: "easeInOut",
									}}
									style={{display: "inline-block"}}
								>
									<IconNode
										iconName="chevronDown"
										size={12}
										onClick={() =>
											handleExpansion(
												RecipientTypeEnum.CC
											)
										}
									/>
								</motion.div>
							</span>
							<EmpEmailSelect multi />
						</div>
						<motion.div
							initial={false}
							animate={{
								height: expanded ? "auto" : 0,
								opacity: expanded ? 1 : 0,
							}}
							transition={{
								duration: 0.3,
								ease: "easeInOut",
							}}
							style={{overflow: "hidden", marginLeft: "1rem"}}
						>
							<div className={styles.emails}>
								<span className={styles.label}>숨은참조</span>
								<EmpEmailSelect multi />
							</div>
						</motion.div>
					</div>
				</div>
				<div className={styles.mailContent}>
					<TextEditor name="message" value={mail?.message || ""} />
				</div>
				<div className={styles.footer}>
					<FileDrop />
					<CommonButtonGroup
						usedButtons={{
							btnSubmit: true,
							btnCancel: true,
							btnTempSave: true,
							btnPreview: true,
						}}
					/>
				</div>
			</div>
		</>
	);
}

// 첨부파일 주석: TODO
// {files &&
// 		files.map((file, idx) => {
// 			const fileName = `${file.fileName}`; // 사용자에게 보여줄 파일명
// 			const fileRealName =
// 				file.filePath.split("/").pop() || fileName; // 실제 폴더에 저장되는 파
// 			// 요건 지우면안됨 헷갈리지말기
// 			const previewUrl = `${GATEWAY_URL}/board/preview/${fileRealName}`;
// 			const downloadUrl = `${previewUrl}?download=true
// 			return (
// 				<div className={styles.file} key={idx}>
// 					<GrAttachment />
// 					<a
// 						download
// 						target="_blank"
// 						href={downloadUrl}
// 						rel="noopener noreferrer"
// 					>
// 						<span>{fileName}</span>
// 					</a>
// 					<spa className={styles.fileSize}>
// 						{file.fileSize}
// 					</spa
// 					{/* <Button
// 					componentType="smallGray"
// 					onClick={(
// 						e: React.MouseEvent<HTMLElement>
// 					) => onClickPreview(e, file)}
// 				>
// 					미리보기
// 				</Button> */}
// 				</div>
// 			);
// 		})}
