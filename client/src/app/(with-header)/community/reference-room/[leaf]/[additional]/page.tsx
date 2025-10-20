"use client";
import {usePathname} from "next/navigation";
import {snakeToPascal} from "@/util/helpers/case-converter";

import PostView from "@/components/src/community/board/PostView";

export default function PostViewPage() {
	const pathname = usePathname();
	const pathSegs = pathname.split("/");
	const [_, mainMenu, subMenu, leafMenu] = pathSegs; // mainMenu: community
	if (!leafMenu) return null;

	const ComponentMap: Record<string, React.FC> = {
		PostView,
	};
	const pascalName = snakeToPascal(leafMenu);
	const Component = ComponentMap[pascalName];

	return <>{Component && <Component />}</>;
}
