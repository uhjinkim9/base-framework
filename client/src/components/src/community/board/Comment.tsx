"use client";
import styles from "./styles/Comment.module.scss";
import {ChangeEvent, useEffect, useState} from "react";
import {RxAvatar, RxCross2, RxPencil1, RxCheck} from "react-icons/rx";

import {CommentType} from "@/components/src/community/board/etc/board.type";
import {requestPost} from "@/util/api/api-service";
import {useUserContext} from "@/context/UserContext";
import {LocalStorage} from "@/util/common/storage";
import {dateTimeWithPeriod} from "@/util/helpers/formatters";

import InputComment from "@/components/common/form-properties/InputComment";

export default function Comment({postIdx: postIdx}: any) {
	const userId = LocalStorage.getUserId();
	const [comments, setComments] = useState<CommentType[]>([]);
	const [editingId, setEditingId] = useState<number | null>(null);

	const {matchUserIdToRank} = useUserContext();

	async function getComments() {
		try {
			const res = await requestPost("/board/getComments", {
				postIdx: postIdx,
			});
			if (res.statusCode === 200) {
				console.log("응답 성공 데이터:", res.data);
				setComments(res.data);
			}
		} catch (error) {
			console.error("Error uploading comment:", error);
		}
	}

	function onChangecomment(
		e: ChangeEvent<HTMLTextAreaElement>,
		cmtIdx: number
	) {
		const {name, value} = e.currentTarget;
		setComments((prev) =>
			prev.map((co) =>
				co.cmtIdx === cmtIdx ? {...co, [name]: value} : co
			)
		);
	}

	async function onEditClick(target: CommentType) {
		const {cmtIdx, comment = ""} = target;
		if (cmtIdx == null) return;
		// 이미 이 댓글을 수정 중이면 => 저장
		if (editingId === cmtIdx) {
			const payload = {
				postIdx,
				cmtIdx,
				comment: comment,
			};

			const res = await requestPost(
				"/board/createOrUpdateComment",
				payload
			);
			setComments((prev) =>
				prev.map((co) =>
					co.cmtIdx === cmtIdx ? {...co, comment: comment} : co
				)
			);

			setEditingId(null); // 편집 종료
			// setDraft("");
			return;
		}

		// 이 댓글을 새로 수정 시작
		setEditingId(cmtIdx); //
		// setDraft(comment);
	}

	async function deleteComment(cmtIdx: number) {
		try {
			await requestPost("/board/deleteComment", {
				cmtIdx: cmtIdx,
			});
			setComments(() => comments.filter((co) => co.cmtIdx !== cmtIdx));
		} catch (error) {
			console.error("Error uploading comment:", error);
		}
	}

	function onUploadComment(newComment: CommentType) {
		setComments((co) => [...co, newComment]);
	}

	useEffect(() => {
		getComments();
	}, [postIdx]);
	return (
		<div>
			{comments.map((comment) => {
				const isRowEditing = comment.cmtIdx === editingId;
				return (
					<div
						className={styles.commentArea}
						key={comment.cmtIdx}
						style={{whiteSpace: "pre-wrap"}}
					>
						<div className={styles.comment}>
							<div className={styles.commentHeader}>
								<div className={styles.commentInfo}>
									<RxAvatar className={styles.avatar} />
									<span className={styles.commentWriter}>
										{matchUserIdToRank(
											comment?.creatorId || "이름없음"
										)}
									</span>
									<span className={styles.commentDate}>
										{comment?.createdAt
											? dateTimeWithPeriod(
													comment.createdAt
											  )
											: null}
									</span>
								</div>

								<div className={styles.deleteComment}>
									{userId === comment?.creatorId ? (
										<>
											<button
												onClick={() =>
													onEditClick(comment)
												}
											>
												{isRowEditing ? (
													<RxCheck />
												) : (
													<RxPencil1 />
												)}
											</button>
											<button
												onClick={() =>
													deleteComment(
														comment?.cmtIdx || 0
													)
												}
											>
												<RxCross2 />
											</button>
										</>
									) : null}
								</div>
							</div>
							<p className={styles.comment}>
								{isRowEditing ? (
									<textarea
										name="comment"
										value={comment.comment || ""}
										onChange={(e) =>
											onChangecomment(e, comment.cmtIdx!)
										}
									></textarea>
								) : (
									<>{comment?.comment}</>
								)}
							</p>
						</div>
					</div>
				);
			})}
			<InputComment
				postIdx={postIdx}
				onUploadComment={(comment: CommentType) =>
					onUploadComment(comment)
				}
			/>
		</div>
	);
}
