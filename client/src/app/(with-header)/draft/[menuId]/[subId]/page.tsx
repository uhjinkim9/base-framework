"use client";
import { useParams } from "next/navigation";

import { useDraftContext } from "@/context/DraftContext";
import { snakeToPascal } from "@/util/helpers/case-converter";
import DraftDashboard from "@/components/src/draft/dashboard/DraftDashboard";
import DraftFormList from "@/components/src/draft/DraftFormList";
import ContentCard from "@/components/common/layout/ContentCard";
import MyDocumentProcessing from "@/components/src/draft/my-document/MyDocumentProcessing";
import MyDocumentRejected from "@/components/src/draft/my-document/MyDocumentRejected";
import MyDocumentCompleted from "@/components/src/draft/my-document/MyDocumentCompleted";
export default function DraftMenuPage() {
  const params = useParams();
  const menuId = String(params.subId);

  const menuNodeMap: Record<string, React.FC> = {
    DraftDashboard,
    DraftFormList,
    MyDocumentProcessing,
    MyDocumentRejected,
    MyDocumentCompleted,
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
