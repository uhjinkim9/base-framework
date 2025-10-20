"use client";
import { useParams } from "next/navigation";

import { useDraftContext } from "@/context/DraftContext";
import { snakeToPascal } from "@/util/helpers/case-converter";
import DraftDashboard from "@/components/src/draft/dashboard/DraftDashboard";
import DraftWriter from "@/components/src/draft/DraftWriter";
import DraftFormList from "@/components/src/draft/DraftFormList";
import ContentCard from "@/components/common/layout/ContentCard";

export default function DraftMenuPage() {
  const params = useParams();
  const menuId = String(params.subId);
  const { draftMenus } = useDraftContext();

  // const CpnentMap: Record<string, React.FC> = {
  // 	DraftDashboard,
  // 	WriteDraft,
  // 	DraftFormList,
  // };

  // const menuNodeMap = draftMenus.reduce(
  // 	(acc: Record<string, () => any>, am: {menuId: string}) => {
  // 		const pascalNm = snakeToPascal(am.menuId);
  // 		const Cpnent = CpnentMap[pascalNm];

  // 		console.log("pascalNm", pascalNm);

  // 		acc[am.menuId] = () =>
  // 			Cpnent ? (
  // 				<Cpnent />
  // 			) : (
  // 				<ContentCard>
  // 					<div>컴포넌트 없음: {pascalNm}</div>
  // 				</ContentCard>
  // 			);
  // 		return acc;
  // 	},
  // 	{}
  // );

  const menuNodeMap: Record<string, React.FC> = {
    DraftWriter,
  };

  const pascalName = snakeToPascal(menuId);
  const RenderComponent = menuNodeMap[pascalName];

  // 안전한 렌더링: RenderComponent가 존재하는 경우에만 렌더링
  return (
    <>
      {RenderComponent ? (
        <RenderComponent />
      ) : (
        <ContentCard>
          <div>페이지를 찾을 수 없습니다: {menuId}</div>
          <div>사용 가능한 메뉴: {Object.keys(menuNodeMap).join(", ")}</div>
        </ContentCard>
      )}
    </>
  );
}
