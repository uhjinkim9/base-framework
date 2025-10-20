"use client";

import AddDocDetail from "@/components/src/docs/AddDocDetail";
import AddDoc from "@/components/src/docs/modal/AddDoc";
import {snakeToPascal} from "@/util/helpers/case-converter";
import {usePathname} from "next/navigation";

export default function DocsSecondPage() {
	const pathname = usePathname();
	const [_, mainMenu, subMenu, leafMenu] = pathname.split("/");

	const ComponentMap: Record<string, React.FC> = {
		AddDoc,
		AddDocDetail,
	};

	const pascalName = snakeToPascal(leafMenu);
	const Component = ComponentMap[pascalName];

	return <Component />;
}
