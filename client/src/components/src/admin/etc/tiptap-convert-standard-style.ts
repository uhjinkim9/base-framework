export function convertColwidthToStyle(html: string) {
	return html.replace(
		/(<td[^>]*?)\scolwidth="(\d+)"([^>]*?>)/g,
		(match, p1, width, p3) => {
			// 기존 style 속성에 추가
			const styleMatch = match.match(/style="([^"]*)"/);
			if (styleMatch) {
				return match
					.replace(
						/style="([^"]*)"/,
						`style="${styleMatch[1]};width:${width}px"`
					)
					.replace(` colwidth="${width}"`, "");
			}
			// style이 없으면 새로 추가
			return `${p1} style="width:${width}px"${p3}`;
		}
	);
}
