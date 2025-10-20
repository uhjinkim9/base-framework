export type MenuType = {
  tempIdx?: number;
  idx?: number;
  menuId: string;
  menuNm: string;
  nodeLevel: number;
  upperNode?: string;
  isUsed: boolean;
  isChangeable: boolean; // 메뉴 ID 변경 가능 여부
  seqNum: string;
  createdAt?: string;
  updatedAt?: string;
};

export type SideBarMenuType = {
  menuIdx?: number;
  menuId: string;
  menuNm: string;
  menuColor?: string; // 메뉴 색상(캘린더 색상)
  nodeLevel?: number;
  upperNode?: string; // 상위 노드 ID
  isCustomed?: boolean; // 커스텀 여부
  isUsed?: boolean; // 사용 여부
  memo?: string; // 설명
  joinEmpNo?: string;
  joinDeptCd?: string;
  seqNum?: number; // 정렬 순서
  creatorId?: string;
  updaterId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  children?: SideBarMenuType[]; // 자식 메뉴 (재귀 구조)
  parent?: SideBarMenuType; // 상위 메뉴 (선택적)
};

export type SideBarMenuSortType =
  | {
      public?: SideBarMenuType[];
      private?: SideBarMenuType[];
    }
  | undefined;
