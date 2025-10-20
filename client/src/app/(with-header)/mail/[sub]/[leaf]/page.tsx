"use client";
import dynamic from "next/dynamic";
import ContactList from "@/components/src/mail/ContactList";

import {useMemo} from "react";
import {usePathname} from "next/navigation";
import {useMailContext} from "@/context/MailContext";
import {SideBarMenuType} from "@/types/menu.type";

type ListComponentProps = {
  menuNodeMap: Record<string, () => any>;
  activeMenuId: string;
};

// 동적 컴포넌트 import
const MailList = dynamic(() => import("@/components/src/mail/MailList"));
const MailSetting = dynamic(() => import("@/components/src/mail/MailSetting"));
const WriteMail = dynamic(() => import("@/components/src/mail/WriteMail"));
const AddContact = dynamic(() => import("@/components/src/mail/AddContact"));
const MailView = dynamic(() => import("@/components/src/mail/MailView"), {
  loading: () => <div>메일을 불러오는 중...</div>,
});

export default function MailLeafPage() {
  const pathname = usePathname();
  const [_, mainMenu, subMenu, leafMenu] = pathname.split("/");
  const {mailMenus} = useMailContext();
  const menus = [...(mailMenus?.private ?? []), ...(mailMenus?.public ?? [])];

  const menuNodeMap = useMemo(() => {
    const map: Record<string, () => any> = {};

    const traverse = (nodes?: SideBarMenuType[]) => {
      if (!Array.isArray(nodes)) return;
      nodes.forEach((node) => {
        if (!node?.menuId) return;
        map[node.menuId] = () => ({
          menuId: node.menuId,
          upperNode: node.upperNode,
        });
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };

    const initialNodes = Array.isArray(menus)
      ? (menus as SideBarMenuType[])
      : [];
    traverse(initialNodes);
    return map;
  }, [menus]);

  const routeComponentRegistry: Record<
    string,
    {
      default: {component: React.ComponentType<any>; passMenuProps?: boolean};
      overrides?: Record<
        string,
        {component: React.ComponentType<any>; passMenuProps?: boolean}
      >;
    }
  > = {
    "mail-list": {
      default: {component: MailList, passMenuProps: true},
      overrides: {
        setting: {component: MailSetting},
        "write-mail": {component: WriteMail},
        "mail-view": {component: MailView},
      },
    },
    contact: {
      default: {component: ContactList, passMenuProps: true},
      overrides: {
        "add-contact": {component: AddContact},
      },
    },
  };

  const routeConfig = routeComponentRegistry[subMenu];
  const routeEntry = routeConfig?.overrides?.[leafMenu] ?? routeConfig?.default;

  if (!routeEntry) {
    return <div>컴포넌트를 찾을 수 없습니다: {leafMenu}</div>;
  }

  const {component: ResolvedComponent, passMenuProps} = routeEntry;

  if (passMenuProps) {
    const ListComponent =
      ResolvedComponent as React.ComponentType<ListComponentProps>;
    return (
      <ListComponent menuNodeMap={menuNodeMap} activeMenuId={leafMenu ?? ""} />
    );
  }

  return <ResolvedComponent />;
}
