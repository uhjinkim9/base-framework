// // 0) 원본 타입을 먼저 로드 (보강임을 명시)
// import "@tiptap/core";
// import "@tiptap/extension-table";

// // 1) table 확장의 command 그룹(TableCommands)에 추가  ← 중첩 금지! core 블록 밖에 별도로
// // declare module "@tiptap/extension-table" {
// // 	interface TableCommands<ReturnType> {
// // 		setTableAlign: (alignment: "left" | "center" | "right") => ReturnType;
// // 	}
// // }

// // 2) 우리 커맨드 네임스페이스들(렌더엘리먼트/폰트사이즈)은 core에 보강
// declare module "@tiptap/core" {
// 	interface Commands<ReturnType> {
// 		renderElement: {
// 			insertRenderElement: (options: {
// 				elementType: string;
// 				id: string;
// 				props?: any;
// 			}) => ReturnType;
// 		};
// 		fontSize: {
// 			setFontSize: (size: string) => ReturnType;
// 		};

// 		// (선택) setTableAlign을 최상위 Commands에도 추가해두면 import 경로 차이로 인텔리센스 빠지는 경우 방지됨
// 		setTableAlign: (alignment: "left" | "center" | "right") => ReturnType;
// 	}

// 	// 체인/싱글 커맨드는 각각 보강 (여기에다 선언해야 툴바에서 체인/싱글에 뜸)
// 	interface ChainedCommands {
// 		setTableAlign: (alignment: "left" | "center" | "right") => this;
// 	}
// 	interface SingleCommands {
// 		setTableAlign: (alignment: "left" | "center" | "right") => boolean;
// 	}
// }

// 전역 d.ts (모듈 보강 파일) — 절대 `export {}` 넣지 말기
import "@tiptap/core";
import "@tiptap/react";

type TableAlign = "left" | "center" | "right";

declare module "@tiptap/react" {
	interface Editor {
		// commands 객체에 시그니처 추가
		commands: import("@tiptap/core").SingleCommands & {
			setTableAlign: (alignment: TableAlign) => boolean;
		};

		// chain() 반환 타입 확장 (교집합으로 안전 확장)
		chain: () => import("@tiptap/core").ChainedCommands & {
			setTableAlign: (alignment: TableAlign) => typeof this;
		};
	}
}
