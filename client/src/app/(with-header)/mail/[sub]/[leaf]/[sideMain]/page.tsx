"use client";
import {usePathname} from "next/navigation";

import {snakeToPascal} from "@/util/helpers/case-converter";

import MailView from "@/components/src/mail/MailView";
import AddContact from "@/components/src/mail/AddContact";

export default function MailSideMainPage() {
  const pathname = usePathname();
  const [_, mainMenu, subMenu, leafMenu] = pathname.split("/");

  // 동적 컴포넌트 맵
  const ComponentMap: Record<string, React.FC> = {
    MailView,
    AddContact,
  };

  // 동적 컴포넌트 찾기
  const pascalName = snakeToPascal(leafMenu);
  const DynamicComponent = ComponentMap[pascalName];

  return <DynamicComponent />;
}
