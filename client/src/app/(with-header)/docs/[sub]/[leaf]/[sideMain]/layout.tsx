"use client";
import styles from "../layout.module.scss";

import ContentCard from "@/components/common/layout/ContentCard";
import {ProofUrlEnum} from "@/components/src/docs/etc/url.enum";
import {usePathname} from "next/navigation";

export default function DraftLayout({children}: {children: React.ReactNode}) {
	const pathname = usePathname();
	const segments = pathname.split("/");

	if (segments[3] === ProofUrlEnum.DASHBOARD) {
		return <div className={styles.content}>{children}</div>;
	}

	return (
		<ContentCard>
			<div className={styles.content}>{children}</div>
		</ContentCard>
	);
}
