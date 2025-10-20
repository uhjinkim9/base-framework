"use client";
import {usePathname} from "next/navigation";

import {snakeToPascal} from "@/util/helpers/case-converter";
import GuidePoll from "@/components/src/community/poll/GuidePoll";
import RespondPoll from "@/components/src/community/poll/RespondPoll";
import ResultPoll from "@/components/src/community/poll/ResultPoll";

/**
 * [URL 끝 부분에 따라 다른 컴포넌트를 렌더링하는 PollMainPage 컴포넌트]
 * 예를 들어, 'guide-poll'이라는 leafMenu가 들어오면 GuidePoll 컴포넌트를 렌더링한다.
 */
export default function PollMainPage() {
	const pathname = usePathname();
	const pathSegs = pathname.split("/");
	const [_, mainMenu, subMenu, leafMenu] = pathSegs; // mainMenu: community

	if (!leafMenu) return null;

	const ComponentMap: Record<string, React.FC> = {
		GuidePoll,
		RespondPoll,
		ResultPoll,
	};

	const pascalName = snakeToPascal(leafMenu);
	const Component = ComponentMap[pascalName];

	return <>{Component && <Component />}</>;
}
