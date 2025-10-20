"use client";
import {useEffect} from "react";
import {useRouter} from "next/navigation";
import "../styles/globals.scss";
import "../styles/tiptap.scss";
import "../styles/print.scss";

export default function RootPage() {
	const router = useRouter();
	useEffect(() => {
		router.push("/login");
	}, []);
}
