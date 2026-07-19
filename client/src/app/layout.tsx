import type {Metadata} from "next";
import "../styles/globals.scss";
import BackgroundSetter from "@/components/common/segment/BackgroundSetter";
import Providers from "./providers";

export const metadata: Metadata = {
	title: process.env.NEXT_PUBLIC_APP_NAME ?? "Base App",
	description: "Reusable monolithic application template",
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
				<Providers>
					<BackgroundSetter />
					{children}
				</Providers>
			</body>
		</html>
	);
}
