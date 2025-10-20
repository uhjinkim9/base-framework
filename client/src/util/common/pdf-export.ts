import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export interface PdfExportOptions {
	filename?: string;
	quality?: number;
	format?:
		| "a0"
		| "a1"
		| "a2"
		| "a3"
		| "a4"
		| "a5"
		| "a6"
		| "a7"
		| "a8"
		| "a9"
		| "a10"
		| "letter"
		| "legal"
		| "tabloid";
	orientation?: "portrait" | "landscape";
	margin?:
		| number
		| {
				top?: number;
				bottom?: number;
				left?: number;
				right?: number;
		  };
}

/**
 * HTML 엘리먼트를 PDF로 변환하여 다운로드
 */
export async function exportToPdf(
	element: HTMLElement,
	options: PdfExportOptions = {}
): Promise<void> {
	const {
		filename = "document.pdf",
		quality = 1,
		format = "a0",
		orientation = "portrait",
		margin = 20,
	} = options;

	// margin을 객체 형태로 정규화
	const normalizedMargin =
		typeof margin === "number"
			? {top: margin, bottom: margin, left: margin, right: margin}
			: {
					top: margin.top ?? 20,
					bottom: margin.bottom ?? 20,
					left: margin.left ?? 20,
					right: margin.right ?? 20,
			  };

	try {
		// HTML을 캔버스로 변환
		const canvas = await html2canvas(element, {
			scale: quality,
			useCORS: true,
			allowTaint: true,
			backgroundColor: "#ffffff",
			scrollX: 0,
			scrollY: 0,
			width: element.scrollWidth,
			height: element.scrollHeight,
		});

		const imgData = canvas.toDataURL("image/png");

		// PDF 문서 생성
		const pdf = new jsPDF({
			orientation,
			unit: "mm",
			format,
		});

		// PDF 페이지 크기 계산
		const pageWidth = pdf.internal.pageSize.getWidth();
		const pageHeight = pdf.internal.pageSize.getHeight();

		// 마진을 고려한 실제 콘텐츠 영역
		const contentWidth =
			pageWidth - (normalizedMargin.left + normalizedMargin.right);
		const contentHeight =
			pageHeight - (normalizedMargin.top + normalizedMargin.bottom);

		// 이미지 크기 계산
		const imgWidth = canvas.width;
		const imgHeight = canvas.height;

		// 비율 계산하여 페이지에 맞게 조정
		const ratio = Math.min(
			contentWidth / (imgWidth * 0.264583),
			contentHeight / (imgHeight * 0.264583)
		);
		const finalWidth = imgWidth * 0.264583 * ratio;
		const finalHeight = imgHeight * 0.264583 * ratio;

		// 중앙 정렬을 위한 위치 계산
		const x = normalizedMargin.left + (contentWidth - finalWidth) / 2;
		const y = normalizedMargin.top;

		// 페이지가 여러 개 필요한 경우 처리
		let heightLeft = finalHeight;
		let position = 0;

		// 첫 번째 페이지 추가
		pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);
		heightLeft -= contentHeight;

		// 추가 페이지가 필요한 경우
		while (heightLeft >= 0) {
			position = heightLeft - finalHeight;
			pdf.addPage();
			pdf.addImage(
				imgData,
				"PNG",
				x,
				position + normalizedMargin.top,
				finalWidth,
				finalHeight
			);
			heightLeft -= contentHeight;
		}

		// PDF 다운로드
		pdf.save(filename);
	} catch (error) {
		console.error("PDF 생성 중 오류 발생:", error);
		throw new Error("PDF 생성에 실패했습니다.");
	}
}

/**
 * 특정 셀렉터의 엘리먼트를 PDF로 내보내기
 */
export async function exportElementToPdf(
	selector: string,
	options: PdfExportOptions = {}
): Promise<void> {
	const element = document.querySelector(selector) as HTMLElement;

	if (!element) {
		throw new Error(`엘리먼트를 찾을 수 없습니다: ${selector}`);
	}

	return exportToPdf(element, options);
}

/**
 * 문서 제목을 기반으로 파일명 생성
 */
export function generatePdfFilename(title: string = "문서"): string {
	const now = new Date();
	const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD

	// 1) 유니코드 정규화
	const normalized = (title ?? "").toString().normalize("NFKC");
	// 2) 파일명에서 불가한 문자 제거(윈도우 공통 금지: \\/:*?"<>|)
	// 3) 전세계 문자/숫자(유니코드), 공백, 점, 언더스코어, 하이픈만 허용
	const sanitized = normalized
		.replace(/[\\\/:*?"<>|]/g, "")
		.replace(/[^\p{L}\p{N}\s._-]/gu, "");

	const cleanTitle = sanitized.trim().replace(/\s+/g, "_").slice(0, 100); // 과도한 길이 방지

	const base = cleanTitle || "문서";
	return `${base}_${dateStr}.pdf`;
}
