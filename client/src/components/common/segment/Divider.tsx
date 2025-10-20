// type: 'soft', 'hard'
export default function Divider({
	type,
	look,
}: {
	type?: "soft" | "middle" | "hard" | "none" | "black";
	look?: "solid" | "dashed" | "dotted";
}) {
	const colorTypeMap = {
		soft: "#f7faff",
		middle: "#d9d9d9",
		hard: "#a1a1a1",
		none: "transparent",
		black: "black",
	};

	return (
		<hr
			style={{
				borderTop:
					type === "none"
						? "none"
						: `0.5px ${look ? look : "solid"} ${
								type ? colorTypeMap[type] : colorTypeMap["soft"]
						  }`,
				borderLeft: "none",
				borderRight: "none",
				borderBottom: "none",
				width: "100%",
				marginTop: "10px",
				marginBottom: "10px",
			}}
		/>
	);
}
