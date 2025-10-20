"use client";
import styles from "./styles/MailView.module.scss";
import clsx from "clsx";
import {usePathname, useRouter} from "next/navigation";
import {useEffect, useState} from "react";

import {useMailContext} from "@/context/MailContext";
import {MailType, RecipientTypeEnum} from "@/types/mail.type";

import {requestPost} from "@/util/api/api-service";
import {saveLastUrl} from "@/util/common/last-url";

import IconNode from "@/components/common/segment/IconNode";
import MailHeaderBtnGroup from "./inner/MailHeaderBtnGroup";
import Button from "@/components/common/form-properties/Button";

export default function MailView({mailIdx}: {mailIdx?: number}) {
	const router = useRouter();
	const pathname = usePathname();
	const [_, mainMenu, subMenu, leafMenu] = pathname.split("/"); // mainMenu: mail, subMenu: proof

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
	}, [mailIdx]);

	const getMail = async () => {
		const res = await requestPost("/mail/getMail", {mailIdx});
		if (res.statusCode === 200) {
			setMail(res.data);
			console.log("MailView: ", res.data);
		}
	};

	return (
		<>
			<div className={styles.mailViewContainer}>
				<MailHeaderBtnGroup />

				<div className={styles.mailInfo}>
					<span className={styles.title}>
						<IconNode
							iconName="star"
							color={mail?.isImportant ? "orange" : "gray4"}
							filled={mail?.isImportant ? true : false}
						/>
						{mail?.subject || "(제목없음)"}
					</span>

					<div className={styles.recipients}>
						<div className={styles.row}>
							<span className={styles.label}>발신</span>
							<span>{mail?.senderEmail || "(발신자없음)"}</span>
						</div>

						<div className={styles.row}>
							<span className={styles.label}>수신</span>
							{mail?.recipients &&
								toRecipients?.map((r, i) => (
									<span key={i}>
										{r.recipientEmail || "(수신자없음)"}
									</span>
								))}
						</div>

						<div className={styles.row}>
							<span className={styles.label}>참조</span>
							{mail?.recipients &&
								ccRecipients?.map((r, i) => (
									<span key={i}>
										{r.recipientEmail || "(참조없음)"}
									</span>
								))}
						</div>

						<div className={styles.row}>
							<span className={styles.label}>숨은참조</span>
							{mail?.recipients &&
								bccRecipients?.map((r, i) => (
									<span key={i}>
										{r.recipientEmail || "(숨은참조없음)"}
									</span>
								))}
						</div>
					</div>
				</div>

				<div className={styles.mailContent}>
					내용 폼파서로 하기! 내용입력은 텍스트에디터 / 내용:
					{mail?.message || "(내용없음)"}
				</div>

				<div className={styles.footer}>
					<div className={styles.attachments}>
						{/* 첨부파일 로직 주석 처리한 자리*/}
						<div className={styles.file}>
							<div
								className={clsx(styles.row, styles.gap0dot2rem)}
							>
								<IconNode
									iconName="attachment"
									color="gray4"
									size={14}
								/>
								<span className={styles.refText}>파일</span>
								<span className={styles.refText}>(1KB)</span>
							</div>
							<Button componentType="smallGray" width="4rem">
								미리보기
							</Button>
						</div>
					</div>

					<div className={styles.buttons}>
						<div className={styles.button}>
							<IconNode
								iconName="share"
								color="gray4"
								size={14}
								circleBorder
							/>
							<span className={styles.refText}>URL 복사</span>
						</div>
						<div className={styles.button}>
							<IconNode
								iconName="print"
								color="gray4"
								size={14}
								circleBorder
							/>
							<span className={styles.refText}>인쇄</span>
						</div>
						<div className={styles.button}>
							<IconNode
								iconName="dragHandle"
								color="gray4"
								size={14}
								circleBorder
							/>
							<span className={styles.refText}>목록</span>
						</div>
					</div>
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
