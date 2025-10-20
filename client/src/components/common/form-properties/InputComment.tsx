"use client";
import styles from "./styles/InputComment.module.scss";
import {useState} from "react";
import {RxAvatar} from "react-icons/rx";

import {CommentType} from "@/components/src/community/board/etc/board.type";
import {requestPost} from "@/util/api/api-service";

import IconNode from "../segment/IconNode";

type InputCommentPropsType = {
	postIdx: number;
	onUploadComment: (comment: CommentType) => void;
};

export default function InputComment(inputCommentProps: InputCommentPropsType) {
	const [comment, setComment] = useState<CommentType>({
		postIdx: inputCommentProps.postIdx,
		comment: "",
	});

	function onChangeComment(e: React.ChangeEvent<HTMLTextAreaElement>) {
		setComment((pr) => ({
			...pr,
			comment: e.target.value,
		}));
	}

	async function createOrUpdateComment(postIdx: number, comment: string) {
		const res = await requestPost("/board/createOrUpdateComment", {
			postIdx,
			comment,
		});
		setComment((prev) => ({...prev, comment: ""}));
		if (res.statusCode === 200) {
			inputCommentProps.onUploadComment(res.data);
			console.log("응답 성공 메시지:", res.message);
			console.log("응답 성공 데이터:", res.data);
		} else {
			console.error("응답 실패 메시지:", res.message);
		}
	}

	return (
		<div className={styles.inputContainer}>
			<div className={styles.avatar}>
				<RxAvatar />
			</div>

			<div className={styles.commentInput}>
				<textarea
					placeholder="댓글을 입력하세요"
					name="comment"
					value={comment.comment}
					onChange={onChangeComment}
				/>
				<div className={styles.commentActions}>
					<button>
						<IconNode
							iconName="attachment"
							size={25}
							color="gray5"
						/>
					</button>
					<button
						onClick={() =>
							createOrUpdateComment(
								comment.postIdx,
								comment.comment
							)
						}
					>
						<IconNode iconName="circleUp" size={25} color="gray5" />
					</button>
				</div>
			</div>
		</div>
	);
}
