"use client";
import {AlertProvider} from "@/context/AlertContext";

export default function LoginLayout({children}: {children: React.ReactNode}) {
	return (
		<AlertProvider>
			<main>{children}</main>
		</AlertProvider>
	);
}
