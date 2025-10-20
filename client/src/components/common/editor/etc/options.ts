import {Level} from "@tiptap/extension-heading";
import {ISelectOption} from "./editor.type";

type IOption = ISelectOption<Level>;
type IFontSizeOption = ISelectOption<string>;

export const headingOpts: IOption[] = [
	{
		value: 1,
		label: "제목 1",
	},
	{
		value: 2,
		label: "제목 2",
	},
	{
		value: 3,
		label: "제목 3",
	},
	{
		value: 4,
		label: "제목 4",
	},
	{
		value: 5,
		label: "제목 5",
	},
	{
		value: 6,
		label: "제목 6",
	},
];

export const fontSizeOpts: IFontSizeOption[] = Array.from(
	{length: (80 - 8) / 4 + 1},
	(_, i) => {
		const px = 8 + i * 4;
		return {
			value: `${px}px`,
			label: `${px}px`,
		};
	}
);

export const valueMapExample: Record<string, string> = {
	"##korNm##": "홍길동",
	"##empNo##": "11110000",
	"##addr1##": "세종특별자치시 어진동",
};
