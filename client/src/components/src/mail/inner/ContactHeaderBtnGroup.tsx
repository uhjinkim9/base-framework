"use client";
import {usePathname} from "next/navigation";

import styles from "../styles/MailList.module.scss";
import clsx from "clsx";
import ButtonBasic from "@/components/common/form-properties/ButtonBasic";
import InputSearch from "@/components/common/form-properties/InputSearch";
import SelectBoxBasic from "@/components/common/form-properties/SelectBoxBasic";

export default function ContactHeaderBtnGroup({
  areAllSelectedFavorites,
  hasSelectedContacts,
  onClickMove,
  onClickBulkFavorite,
  onClickBulkDelete,
  searchKeyword,
  onSearch,
  searchCategoryOptions,
  selectedSearchCategory,
  onSearchCategoryChange,
}: {
  areAllSelectedFavorites?: boolean;
  hasSelectedContacts?: boolean;
  onClickMove?: () => void;
  onClickBulkFavorite?: (isAddingToFavorites: boolean) => void;
  onClickBulkDelete?: () => void;
  searchKeyword?: string;
  onSearch?: (keyword: string) => void;
  searchCategoryOptions?: Array<{label: string; value: string}>;
  selectedSearchCategory?: string;
  onSearchCategoryChange?: (category: string) => void;
}) {
  const pathname = usePathname();
  const pathSegs = pathname.split("/");
  const [_, mainMenu, subMenu, leafMenu] = pathSegs;

  return (
    <>
      <div className={styles.mailListHeader}>
        <div className={clsx(styles.row, styles.gap1rem)}>
          <div className={styles.inRowGroup}>
            {leafMenu !== "contact-company" &&
              leafMenu !== "contact-favorite" && (
                <>
                  <ButtonBasic
                    componentType="grayBorder"
                    width="4rem"
                    onClick={onClickMove}
                    disabled={!hasSelectedContacts}
                  >
                    이동
                  </ButtonBasic>
                  <ButtonBasic
                    componentType="grayBorder"
                    width="4rem"
                    disabled={!hasSelectedContacts}
                    onClick={onClickBulkDelete}
                  >
                    삭제
                  </ButtonBasic>
                </>
              )}

            <ButtonBasic
              componentType="grayBorder"
              width="6rem"
              disabled={!hasSelectedContacts}
              onClick={() => onClickBulkFavorite?.(!areAllSelectedFavorites)}
            >
              {hasSelectedContacts && areAllSelectedFavorites
                ? "즐겨찾기 해제"
                : "즐겨찾기"}
            </ButtonBasic>
          </div>
        </div>

        <div className={clsx(styles.row, styles.gap05rem)}>
          <SelectBoxBasic
            value={selectedSearchCategory}
            customOptions={searchCategoryOptions}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onSearchCategoryChange?.(e.target.value)}
            width="5rem"
          />
          <InputSearch 
            componentType="inList" 
            value={searchKeyword || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearch?.(e.target.value)}
          />
        </div>
      </div>
    </>
  );
}
