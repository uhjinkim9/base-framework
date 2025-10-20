"use client";
import {usePathname} from "next/navigation";

import {snakeToPascal} from "@/util/helpers/case-converter";
import AddPost from "@/components/src/community/board/AddPost";

export default function BoardLeafPage() {
	const pathname = usePathname();
	const pathSegs = pathname.split("/");
	const [_, mainMenu, subMenu, leafMenu] = pathSegs;
	console.log({pathSegs});

	const ComponentMap: Record<string, React.FC> = {
		AddPost,
	};
	const pascalName = snakeToPascal(leafMenu);
	const Component = ComponentMap[pascalName];

	return <>{Component && <Component />}</>;
}
