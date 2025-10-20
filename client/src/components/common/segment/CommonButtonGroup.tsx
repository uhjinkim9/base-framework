"use client";
import styles from "./styles/CommonButtonGroup.module.scss";
import Link from "next/link";

import {
	BsFileEarmarkCheck,
	BsList,
	BsArrowUp,
	BsTrash3,
	BsDownload,
	BsEye,
	BsPrinter,
} from "react-icons/bs";
import {RxCross1} from "react-icons/rx";
import {PiPencilSimpleLight} from "react-icons/pi";
import {HiOutlineDocumentReport} from "react-icons/hi";
import {MdOutlineTaskAlt} from "react-icons/md";

type Props = {
	usedButtons: UsedButtonsType;
	submitBtnLabel?: string;
	cancelBtnLabel?: string;
	editBtnLabel?: string;
	isEditing?: boolean;
	listUrl?: string;
	onShowResult?: () => void;
	onCancel?: () => void;
	onEdit?: (prev: boolean) => void;
	onSubmit?: (isTemp: boolean) => void; // isTemp: 임시저장 여부
	onDelete?: () => void;
	onRespond?: () => void;
	onDownload?: () => void;
	onShowPreview?: () => void;
	onPrint?: () => void;
};

export type UsedButtonsType = {
	btnShowResult?: boolean;
	btnEdit?: boolean;
	btnTempSave?: boolean;
	btnList?: boolean;
	btnCancel?: boolean;
	btnSubmit?: boolean;
	btnDelete?: boolean;
	btnRespond?: boolean;
	btnDownload?: boolean;
	btnPreview?: boolean;
	btnPrint?: boolean;
};

export default function CommonButtonGroup({
	usedButtons = {
		btnEdit: false,
		btnTempSave: false,
		btnList: false,
		btnCancel: false,
		btnSubmit: true,
		btnRespond: true,
		btnDownload: false,
		btnPreview: false,
		btnPrint: false,
	},
	submitBtnLabel = "등록",
	cancelBtnLabel = "취소",
	editBtnLabel = "수정",
	isEditing = false,
	listUrl = "./",
	onShowResult,
	onCancel,
	onEdit,
	onSubmit,
	onDelete,
	onRespond,
	onDownload,
	onShowPreview,
	onPrint,
}: Props) {
	return (
		<div className={styles.wrapper}>
			{usedButtons.btnEdit && (
				<button
					className={styles.buttonWrapper}
					onClick={() => onEdit?.(isEditing)}
				>
					<div className={styles.iconWrapper}>
						<PiPencilSimpleLight className={styles.icon} />
					</div>
					<span>{editBtnLabel}</span>
				</button>
			)}

			<div className={styles.buttonGroup}>
				{usedButtons.btnShowResult && (
					<button
						className={styles.buttonWrapper}
						onClick={() => onShowResult?.()}
					>
						<div className={styles.iconWrapper}>
							<HiOutlineDocumentReport className={styles.icon} />
						</div>
						<span>결과</span>
					</button>
				)}

				{usedButtons.btnRespond && (
					<button
						className={styles.buttonWrapper}
						onClick={() => onRespond?.()}
					>
						<div className={styles.iconWrapper}>
							<MdOutlineTaskAlt className={styles.icon} />
						</div>
						<span>응답</span>
					</button>
				)}

				{usedButtons.btnDelete && (
					<button
						className={styles.buttonWrapper}
						onClick={() => onDelete?.()}
					>
						<div className={styles.iconWrapper}>
							<BsTrash3 className={styles.icon} />
						</div>
						<span>삭제</span>
					</button>
				)}

				{usedButtons.btnPrint && (
					<button
						className={styles.buttonWrapper}
						onClick={() => onPrint?.()}
					>
						<div className={styles.iconWrapper}>
							<BsPrinter className={styles.icon} />
						</div>
						<span>인쇄</span>
					</button>
				)}
			</div>

			{usedButtons.btnDownload && (
				<button
					className={styles.buttonWrapper}
					onClick={() => onDownload?.()}
				>
					<div className={styles.iconWrapper}>
						<BsDownload className={styles.icon} />
					</div>
					<span>다운로드</span>
				</button>
			)}

			{usedButtons.btnPreview && (
				<button
					className={styles.buttonWrapper}
					onClick={() => onShowPreview?.()}
				>
					<div className={styles.iconWrapper}>
						<BsEye className={styles.icon} />
					</div>
					<span>미리보기</span>
				</button>
			)}

			{usedButtons.btnCancel && (
				<button className={styles.buttonWrapper} onClick={onCancel}>
					<div className={styles.iconWrapper}>
						<RxCross1 className={styles.icon} />
					</div>
					<span>{cancelBtnLabel}</span>
				</button>
			)}
			{usedButtons.btnList && (
				<Link href={listUrl}>
					<button className={styles.buttonWrapper}>
						<div className={styles.iconWrapper}>
							<BsList className={styles.icon} />
						</div>
						<span>목록</span>
					</button>
				</Link>
			)}
			{usedButtons.btnTempSave && (
				<button
					className={styles.buttonWrapper}
					onClick={() => onSubmit?.(true)}
				>
					<div className={styles.iconWrapper}>
						<BsFileEarmarkCheck className={styles.icon} />
					</div>
					<span>임시저장</span>
				</button>
			)}

			{usedButtons.btnSubmit && (
				<button
					className={styles.buttonWrapper}
					onClick={() => onSubmit?.(false)}
				>
					<div className={styles.iconWrapper}>
						<BsArrowUp className={styles.icon} />
					</div>
					<span>{submitBtnLabel}</span>
				</button>
			)}
		</div>
	);
}
