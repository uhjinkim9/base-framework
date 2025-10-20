export type StatusColor =
	| "red"
	| "blue"
	| "gray"
	| "green"
	| "orange"
	| "yellow"
	| "transparent";

export type StatusBoxItem = {
	idx?: number;
	text: string | React.ReactNode;
	color: StatusColor;
};
