"use client";
import {usePathname} from "next/navigation";
import {snakeToPascal} from "@/util/helpers/case-converter";

import ManageHeaderMenu from "@/components/src/admin/system/ManageHeaderMenu";
import ManageUser from "@/components/src/admin/system/ManageUser";
import AdminRole from "@/components/src/admin/AdminRole";
import AdminAssignRole from "@/components/src/admin/AdminAssignRole";
import AdminBoard from "@/components/src/admin/admin-sub/AdminBoard";
import AdminProof from "@/components/src/admin/admin-sub/AdminProof";
import AddForm from "@/components/src/admin/admin-sub/AddForm";
import AdminAttendancePolicy from "@/components/src/admin/admin-sub/AdminAttendancePolicy";
import AdminAttendanceUser from "@/components/src/admin/admin-sub/AdminAttendanceUser";
import AdminAttendanceEdit from "@/components/src/admin/admin-sub/AdminAttendanceEdit";

export default function AdminLeafPage() {
  const pathname = usePathname();
  const pathSegs = pathname.split("/");
  const [_, mainMenu, subMenu, leafMenu] = pathSegs;

  const ComponentMap: Record<string, React.FC> = {
    ManageHeaderMenu,
    ManageUser,
    AdminRole,
    AdminAssignRole,
    AdminBoard,
    AdminProof,
    AddForm,
    AdminAttendancePolicy,
    AdminAttendanceUser,
    AdminAttendanceEdit,
  };

  const pascalName = snakeToPascal(leafMenu);
  const Component = ComponentMap[pascalName];

  return <>{Component && <Component />}</>;
}
