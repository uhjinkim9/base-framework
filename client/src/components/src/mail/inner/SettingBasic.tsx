"use client";
import styles from "../styles/MailSetting.module.scss";
import clsx from "clsx";
import {usePathname, useRouter} from "next/navigation";

import InputBasic from "@/components/common/form-properties/InputBasic";
import Toggle from "@/components/common/form-properties/Toggle";
import Button from "@/components/common/form-properties/Button";

export default function SettingBasic({mailIdx}: {mailIdx?: number}) {
	const router = useRouter();
	const pathname = usePathname();
	const [_, mainMenu, subMenu, leafMenu] = pathname.split("/"); // mainMenu: mail, subMenu: proof

	// const [mail, setMail] = useState<MailType | null>(null);

	// useEffect(() => {
	// 	console.log("mailIdx", mailIdx);
	// }, [mailIdx]);

	return (
		<>
			<div className={clsx(styles.row, styles.gap1rem)}>
				<span className={styles.label}>발신인 이름</span>
				<InputBasic name="senderNm" />
			</div>
			<div className={clsx(styles.row, styles.gap1rem)}>
				<span className={styles.label}>목록 개수</span>
				<InputBasic name="listCount" type="number" value={20} />
			</div>
			<div className={clsx(styles.row, styles.gap1rem)}>
				<span className={styles.label}>휴지통 사용</span>
				<Toggle name="useTrash" />
				<Button
					name="emptyTrash"
					componentType="smallGray"
					width="7rem"
				>
					휴지통 비우기
				</Button>
			</div>
			<div className={clsx(styles.row, styles.gap1rem)}></div>
			<div className={clsx(styles.row, styles.gap1rem)}>
				<span className={styles.label}>자동 삭제</span>
				<Toggle name="autoDelete" />
				{/* 아래 인풋은 autoDelete가 true일 경우 */}
				<InputBasic
					name="autoDeleteDuration"
					type="number"
					value={20}
				/>
				<span className={styles.label}>일 후</span>
			</div>
		</>
	);
}
