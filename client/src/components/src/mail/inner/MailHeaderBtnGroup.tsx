"use client";
import styles from "../styles/MailList.module.scss";
import clsx from "clsx";
import {usePathname, useRouter} from "next/navigation";

import CheckBox from "@/components/common/form-properties/CheckBox";
import ButtonBasic from "@/components/common/form-properties/ButtonBasic";
import IconNode from "@/components/common/segment/IconNode";
import InputSearch from "@/components/common/form-properties/InputSearch";

export default function MailHeaderBtnGroup({
	containingIcons = false,
}: {
	containingIcons?: boolean;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const [_, mainMenu, subMenu, leafMenu] = pathname.split("/"); // mainMenu: mail, subMenu: proof

	const onClickMailSetting = () => {
		const settingUrl = `/${mainMenu}/mail-list/setting`;
		router.push(settingUrl);
	};

	return (
		<>
			<div className={styles.mailListHeader}>
				<div className={clsx(styles.row, styles.gap2rem)}>
					{containingIcons && (
						<div className={styles.inRowGroup}>
							<CheckBox componentType="orange" />
							<IconNode iconName="refresh" color="gray4" />
							<IconNode iconName="sortDesc" color="gray4" />
						</div>
					)}

					<div className={styles.inRowGroup}>
						<ButtonBasic componentType="grayBorder" width="3.7rem">
							스팸신고
						</ButtonBasic>
						<ButtonBasic componentType="basic" width="3.7rem">
							답장
						</ButtonBasic>
						<ButtonBasic componentType="grayBorder" width="3.7rem">
							삭제
						</ButtonBasic>
						<ButtonBasic componentType="grayBorder" width="3.7rem">
							중요
						</ButtonBasic>
						<ButtonBasic componentType="grayBorder" width="3.7rem">
							전달
						</ButtonBasic>
						<ButtonBasic componentType="grayBorder" width="3.7rem">
							읽음
						</ButtonBasic>
						<ButtonBasic componentType="grayBorder" width="3.7rem">
							이동
						</ButtonBasic>
						<IconNode
							iconName="tuning"
							color="gray4"
							onClick={onClickMailSetting}
						/>
					</div>
				</div>

				<InputSearch componentType="inList" />
			</div>
		</>
	);
}
