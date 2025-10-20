import type {Metadata} from "next";
import "../styles/globals.scss";
import "../styles/print.scss";
import BackgroundSetter from "@/components/common/segment/BackgroundSetter";

export const metadata: Metadata = {
	title: "UCUBERS",
	description: "THE UCUBE GROUPWARE",
	icons: {
		icon: "/favicon.ico",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ko">
			<body>
				<BackgroundSetter />
				{children}
			</body>
		</html>
	);
}
