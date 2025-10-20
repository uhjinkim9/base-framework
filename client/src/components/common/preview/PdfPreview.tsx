"use client";
import {useEffect, useState} from "react";
import {Worker, Viewer} from "@react-pdf-viewer/core";
import {requestGetBlob} from "@/util/api/api-service";
import Loading from "@/app/loading";
import "@react-pdf-viewer/core/lib/styles/index.css";

type PreviewPropsType = {
	fileName: string;
};

export default function PdfPreview({fileName}: PreviewPropsType) {
	const [pdfUrl, setPdfUrl] = useState<string | null>(null);

	const fetchPdf = async () => {
		try {
			const blob = await requestGetBlob(`/board/preview/${fileName}`);
			const objectUrl = URL.createObjectURL(blob);
			setPdfUrl(objectUrl);
		} catch (err) {
			console.error("PDF fetch 실패", err);
		}
	};

	useEffect(() => {
		fetchPdf();
	}, [fileName]);

	if (!pdfUrl) return <Loading></Loading>;

	return (
		<Worker
			workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}
		>
			<Viewer fileUrl={pdfUrl} />
		</Worker>
	);
}
