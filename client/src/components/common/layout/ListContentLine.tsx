"use client";
import styles from "./styles/ListContentLine.module.scss";
import clsx from "clsx";

import ProfileImage from "@/components/common/segment/ProfileImage";
import Divider from "@/components/common/segment/Divider";
import StatusPrefix from "@/components/common/segment/StatusPrefix";

import {dateTimeWithPeriod} from "@/util/helpers/formatters";
import {StatusBoxItem} from "../segment/etc/list-content-card.type";

// NewListContentCard의 얇은 버전
// 아직 수정 중

export default function ListContentLine({
	title,
	explanation,
	creator,
	createdAt,
	onClickTitle,
	statusBox,
}: {
	title?: string;
	explanation?: string;
	creator?: string;
	createdAt?: Date;
	onClickTitle?: () => void;
	statusBox?: StatusBoxItem[];
	period?: string;
}) {
	return (
		<>
			<div className={styles.wrapper}>
				<div className={styles.status}>
					{statusBox && statusBox.length > 0 && (
						<StatusPrefix statusBox={statusBox} />
					)}

					<span onClick={onClickTitle} className={styles.title}>
						{title}
					</span>
				</div>

				{explanation ? (
					<span
						className={clsx(
							styles.subContentText,
							styles.refText,
							styles.ellipsis
						)}
					>
						{explanation}
					</span>
				) : null}

				<div className={styles.creator}>
					<ProfileImage
						path="/ko-kil-dong.png"
						alt="profile"
						size="1.5rem"
					/>

					<div className={styles.creator}>
						<div className={clsx(styles.row, styles.gap0dot7rem)}>
							<span className={styles.name}>
								{creator ?? "(이름 없음)"}
							</span>
							<span className={styles.smallInfo}>
								{createdAt
									? dateTimeWithPeriod(createdAt)
									: "(작성일 없음)"}
							</span>
						</div>
					</div>
				</div>
			</div>
			<Divider type="middle" />
		</>
	);
}
