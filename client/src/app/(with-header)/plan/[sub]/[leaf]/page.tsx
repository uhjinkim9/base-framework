"use client";

import dynamic from "next/dynamic";
import {useMemo, type ComponentType} from "react";
import {usePathname} from "next/navigation";

import {usePlanContext} from "@/context/PlanContext";
import {SideBarMenuType} from "@/types/menu.type";
import {snakeToPascal} from "@/util/helpers/case-converter";

type RoutedComponentProps = {
  menuNodeMap: Record<string, {menuId: string; upperNode?: string | null}>;
  activeMenuId: string;
};

const CalendarView = dynamic(() => import("@/components/src/plan/Calendar"));
const AttendanceView = dynamic(
  () => import("@/components/src/plan/AttendanceCalendar"),
);
const AttendanceStatusView = dynamic(
  () => import("@/components/src/plan/AttendanceStatus"),
);
const EmpAttendance = dynamic(
  () => import("@/components/src/plan/EmpAttendance"),
);

export default function PlanLeafPage() {
  const pathname = usePathname();
  const pathSegs = pathname.split("/");
  const [_, main, subMenu, leafMenu] = pathSegs;

  const {planMenus} = usePlanContext();
  const menus = useMemo(() => {
    if (!planMenus) return [];
    return [...(planMenus.private ?? []), ...(planMenus.public ?? [])];
  }, [planMenus]);

  const menuNodeMap = useMemo(() => {
    const map: Record<string, {menuId: string; upperNode?: string | null}> = {};

    const traverse = (nodes?: SideBarMenuType[]) => {
      if (!Array.isArray(nodes)) return;
      nodes.forEach((node) => {
        if (!node?.menuId) return;
        map[node.menuId] = {
          menuId: node.menuId,
          upperNode: node.upperNode,
        };
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };

    traverse(menus as SideBarMenuType[]);
    return map;
  }, [menus]);

  const routeComponentRegistry: Record<
    string,
    {
      default: {
        component: ComponentType<any>;
        passMenuProps?: boolean;
      };
      overrides?: Record<
        string,
        {
          component: ComponentType<any>;
          passMenuProps?: boolean;
        }
      >;
    }
  > = {
    calendar: {
      default: {component: CalendarView},
    },
    attendance: {
      default: {component: AttendanceView},
      overrides: {
        "attendance-status": {component: AttendanceStatusView},
        "emp-attendance": {component: EmpAttendance},
      },
    },
  };

  if (!subMenu) {
    return null;
  }

  const routeConfig = routeComponentRegistry[subMenu];
  const routeEntry =
    leafMenu && routeConfig?.overrides?.[leafMenu]
      ? routeConfig.overrides[leafMenu]
      : routeConfig?.default;

  if (!routeEntry) {
    return (
      <div>
        지원하지 않는 Plan 화면입니다: {subMenu}
        {leafMenu ? ` / ${leafMenu}` : ""}
      </div>
    );
  }

  const {component: ResolvedComponent, passMenuProps} = routeEntry;

  if (passMenuProps) {
    const ComponentWithMenus =
      ResolvedComponent as ComponentType<RoutedComponentProps>;
    return (
      <ComponentWithMenus
        menuNodeMap={menuNodeMap}
        activeMenuId={leafMenu ?? ""}
      />
    );
  }

  return <ResolvedComponent />;
}
