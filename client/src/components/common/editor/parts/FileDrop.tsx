"use client";
import styles from "../styles/FileDrop.module.scss";

import {Dispatch, SetStateAction, useEffect, useState} from "react";
import {filePost, requestPost} from "@/util/api/api-service";

import {MdClose} from "react-icons/md";
import IconNode from "../../segment/IconNode";

type fileInfoType = {
	fileIdx?: number;
	postIdx?: number;
	fileType?: string;
	fileName?: string; // 사용자에게 보여줄 원본 파일명
	fileSize?: string;
	filePath?: string;
	raw?: File;
	createdAt?: string;
	moduleNm?: string;
};

type FileDropProps = {
	setFileIndexes?: Dispatch<SetStateAction<number[]>>;
	fileIdxes?: string;
	moduleNm?: string; // 모듈명 추가
};

export default function FileDrop({
	setFileIndexes,
	fileIdxes,
	moduleNm = "board",
}: FileDropProps) {
	const [isActive, setActive] = useState(false);
	const [uploadInfo, setUploadInfo] = useState<fileInfoType[]>([]);

	const handleDragStart = () => setActive(true);

	function handleDrop(e: React.DragEvent) {
		e.preventDefault();
		setActive(false);
		const files = e.dataTransfer.files;
		if (files.length > 0) {
			addFiles(files);
		}
	}

	function addFiles(files: FileList) {
		const fileArray: fileInfoType[] = Array.from(files).map((file) => ({
			fileName: file.name,
			fileSize: `${(file.size / 1024).toFixed(2)} KB`,
			fileType: file.type,
			raw: file,
			moduleNm: moduleNm, // props로 받은 moduleNm 사용
		}));
		setUploadInfo((prev) => [...prev, ...fileArray]);

		uploadFiles(fileArray);
	}

	async function uploadFiles(filesToUpload: fileInfoType[]) {
		const normalFiles: fileInfoType[] = [];

		filesToUpload.forEach((file) => {
			normalFiles.push(file);
		});

		// 일반 파일 서버 업로드
		if (normalFiles.length > 0) {
			const formData = new FormData();
			normalFiles.forEach((file) => {
				if (file.raw) {
					formData.append("files", file.raw);
				}
			});

			// URL 파라미터로 moduleNm 전달 (FormData에서 제거)
			const module = normalFiles[0]?.moduleNm || "default";

			const res = await filePost(`/file/uploadFiles/${module}`, formData);
			if (res.statusCode === 200) {
				console.log("응답 성공 메시지:", res.message);
				console.log("응답 성공 데이터:", res.data.uploaded);
				const indexes: number[] = res.data.uploaded?.map(
					(item: {fileIdx: number}) => item.fileIdx
				);
				setFileIndexes?.((prev) => [...prev, ...indexes]);
			} else {
				console.error("파일 업로드 오류");
			}
		}
	}

	const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (files) {
			addFiles(files);
		}
	};

	function removeFile(index: number, fileIdx: number) {
		setUploadInfo((prev) => prev.filter((_, i) => i !== index));

		async function removeFileOnServer(fileIdx: number) {
			try {
				await requestPost("/file/deleteFile", {fileIdx: fileIdx});
			} catch (e) {
				console.error("파일 삭제 실패", e);
			}
		}

		if (fileIdx) {
			removeFileOnServer(fileIdx);
		}
	}

	useEffect(() => {
		const idxStrArr = fileIdxes?.split(",");
		if (idxStrArr) {
			const idxNumArr = idxStrArr.map((num) => Number(num));
			getFiles(idxNumArr);
		}
	}, [fileIdxes]);

	async function getFiles(idxNumArr: number[]) {
		const res = await requestPost("/file/getFiles", {
			fileIdxes: idxNumArr,
			moduleNm: moduleNm, // props로 받은 moduleNm 전달
		});
		setUploadInfo(() => res);
	}

	return (
		<>
			<label
				className={`${styles.preview} ${isActive ? styles.active : ""}`}
				onDragEnter={handleDragStart}
				onDragLeave={() => setActive(false)}
				onDragOver={(e) => e.preventDefault()}
				onDrop={handleDrop}
			>
				<div className={styles.inputWrapper}>
					<input type="file" multiple onChange={handleFileInput} />
					<IconNode iconName="attachment" size={12} />
					<span>파일 드롭 또는 클릭</span>
				</div>
			</label>

			{uploadInfo.length > 0 && (
				<div className={styles.attachments}>
					{uploadInfo.map((file, idx) => (
						<div key={idx} className={styles.file}>
							<IconNode iconName="attachment" size={12} />
							<span>{file.fileName}</span>
							<span className={styles.fileSize}>
								{file.fileSize}
							</span>

							<MdClose
								className={styles.deleteIcon}
								onClick={() =>
									removeFile(idx, file.fileIdx ?? 0)
								}
							/>
							{/* <IconNode
                	// className={styles.deleteIcon}
									iconName="cross"
									size={12}
									color="gray4"
                  onClick={() =>
										removeFile(idx, file.fileIdx ?? 0)
									}
								/> */}
						</div>
					))}
				</div>
			)}
		</>
	);
}
