import "@tiptap/core";

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		renderElement: {
			insertRenderElement: (options: {
				elementType: string;
				id: string;
				props?: any;
			}) => ReturnType;
		};
		fontSize: {
			setFontSize: (size: string) => ReturnType;
		};
	}
}
