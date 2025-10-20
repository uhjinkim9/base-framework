import {GATEWAY_URL} from "@/util/common/config";
import {filePost} from "@/util/api/api-service";
import {Extension} from "@tiptap/core";
import {Plugin} from "prosemirror-state";

const ImageDragDrop = Extension.create({
	name: "imageDragDrop",

	addProseMirrorPlugins() {
		async function uploadFile(file: File) {
			const formData = new FormData();
			formData.append("file", file); // 이 이름과 컨트롤러의 FilesInterceptor 이름과 일치해야 함

			try {
				const res = await filePost("/post/uploadFile", formData);
				if (res) {
					return res;
				}
				return null;
			} catch (error) {
				console.error("업로드 중 오류 발생:", error);
			}
		}

		return [
			new Plugin({
				props: {
					handleDOMEvents: {
						drop: (view, event) => {
							event.preventDefault();
							const files = event.dataTransfer?.files;
							if (!files || files.length === 0) return false;

							const file = files[0];
							if (!file.type.startsWith("image/")) return false;

							uploadFile(file).then((file) => {
								if (file.filePath) {
									const {schema} = view.state;
									const node = schema.nodes.image.create({
										src: `${GATEWAY_URL}${file.filePath}`,
									});

									const transaction =
										view.state.tr.replaceSelectionWith(
											node
										);
									view.dispatch(transaction);
								}
							});

							return true; // drop 처리 완료
						},
					},
				},
			}),
		];
	},
});

export default ImageDragDrop;
