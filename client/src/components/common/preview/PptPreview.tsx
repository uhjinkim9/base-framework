"use client";

import {GATEWAY_URL} from "@/util/common/config";

export default function PptPreview({fileName}: {fileName: string}) {
	// const fileUrl = `${GATEWAY_URL}/uploads/${encodeURIComponent(fileName)}`;
	const ngrokUrl = "https://d483-121-135-240-42.ngrok-free.app/";
	const fileUrl = `${ngrokUrl}/uploads/${encodeURIComponent(fileName)}`;
	// const viewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
	// 	fileUrl
	// )}`;
	const viewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
		"https://ucubers-uploads.s3.ap-southeast-2.amazonaws.com/UCUBE_Company-Introduction_20240516-069111cc-afd9-441c-ac02-28153d77f91c.pptx"
	)}`;

	console.log("fileUrl", fileUrl);
	console.log("viewerUrl", viewerUrl);

	return (
		<iframe
			src={viewerUrl}
			width="100%"
			height="600px"
			style={{border: "none"}}
		/>
	);
}
