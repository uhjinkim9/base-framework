// 색 대비
export function getContrastTextColor(hexColor: string): string {
	if (!hexColor) return "#000"; // fallback

	const r = parseInt(hexColor.slice(1, 3), 16);
	const g = parseInt(hexColor.slice(3, 5), 16);
	const b = parseInt(hexColor.slice(5, 7), 16);

	// YIQ 색상 밝기 계산법
	const yiq = (r * 299 + g * 587 + b * 114) / 1000;

	return yiq >= 128 ? "#000" : "#fff"; // 밝으면 검정, 어두우면 흰색
}
