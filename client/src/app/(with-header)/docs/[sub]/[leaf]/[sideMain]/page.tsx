"use client";
import {usePathname} from "next/navigation";
import {snakeToPascal} from "@/util/helpers/case-converter";

import StatusDashboard from "@/components/src/docs/StatusDashboard";
import ProofList from "@/components/src/docs/ProofList";
import ViewProof from "@/components/src/docs/ViewProof";
import AddDocDetail from "@/components/src/docs/AddDocDetail";
import ReceivedReq from "@/components/src/docs/ReceivedReq";

export default function DocsThirdPage() {
	const pathname = usePathname();
	const [_, mainMenu, subMenu, leafMenu, sideMain] = pathname.split("/");

	// dashboard, status에 해당하는 컴포넌트 맵
	const ComponentMap: Record<string, React.FC> = {
		AddDocDetail,
		StatusDashboard,
		ViewProof,
		ReceivedReq,
	};

	// 동적 컴포넌트 찾기
	const pascalName = snakeToPascal(leafMenu);
	const DynamicComponent = ComponentMap[pascalName];

	// sideMain 기반 컴포넌트 (leafMenuNodeMap용)
	const additionalPascalName = snakeToPascal(sideMain);
	const AdditionalComponent = ComponentMap[additionalPascalName];

	const menuNodeMap = {
		[subMenu]: () => ({
			menuId: sideMain, // additionalMenu를 menuId로 사용 (예: "status-dashboard")
			upperNode: leafMenu, // subMenu를 upperNode로 사용 (예: "status")
		}),
	};

	const leafMenuNodeMap: Record<string, () => any> = {
		dashboard: () => <AdditionalComponent />,
		status: () => <ProofList menuNodeMap={menuNodeMap} />,
		manager: () => <ProofList menuNodeMap={menuNodeMap} />,
	};

	return (
		<>
			{leafMenuNodeMap[leafMenu]?.() ||
				(DynamicComponent ? (
					<DynamicComponent />
				) : (
					<div>컴포넌트를 찾을 수 없습니다: {leafMenu}</div>
				))}
		</>
	);
}
