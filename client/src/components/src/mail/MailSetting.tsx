"use client";
import styles from "./styles/WriteMail.module.scss";
import clsx from "clsx";
import {motion} from "framer-motion";
import {usePathname, useRouter} from "next/navigation";
import {useEffect, useState} from "react";

import {MailType, RecipientTypeEnum} from "@/types/mail.type";

import {requestPost} from "@/util/api/api-service";

import Tabs from "@/components/common/layout/Tabs";
import SettingBasic from "./inner/SettingBasic";
import SettingFolder from "./inner/SettingFolder";
import SettingAutograph from "./inner/SettingAutograph";
import SettingForwarding from "./inner/SettingForwarding";
import SettingAutoSort from "./inner/SettingAutoSort";

export default function MailSetting({mailIdx}: {mailIdx?: number}) {
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
		console.log("mailIdx", mailIdx);
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
			<Tabs
				tabs={[
					<span className={styles.label}>기본 설정</span>,
					<span className={styles.label}>메일함 관리</span>,
					<span className={styles.label}>서명</span>,
					<span className={styles.label}>포워딩</span>,
					<span className={styles.label}>자동 분류</span>,
				]}
				contents={[
					<SettingBasic />,
					<SettingFolder />,
					<SettingAutograph />,
					<SettingForwarding />,
					<SettingAutoSort />,
				]}
			/>
		</>
	);
}
