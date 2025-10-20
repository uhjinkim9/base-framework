export async function copyText(
	text: string,
	onSuccess?: () => void,
	onError?: (err: any) => void
) {
	if (!text) return;

	try {
		await navigator.clipboard.writeText(text);
		onSuccess?.();
	} catch (err) {
		onError?.(err);
	}
}

export const copyCurrentUrlToClipboard = (
	onSuccess?: () => void,
	onError?: (err: any) => void
) => {
	const url = window.location.href;
	navigator.clipboard
		.writeText(url)
		.then(() => {
			onSuccess?.();
		})
		.catch((err) => {
			console.error("URL 복사 실패:", err);
			onError?.(err);
		});
};
