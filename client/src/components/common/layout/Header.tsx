"use client";
import styles from "./styles/Header.module.scss";
import Link from "next/link";
import HeaderText from "./HeaderText";
import InputSearch from "@/components/common/form-properties/InputSearch";
import HeaderMenuBar from "./HeaderMenuBar";
import IconImage from "../segment/IconImage";

import {ChangeEvent, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {CookieStorage, LocalStorage} from "@/util/common/storage";
import {disconnectSocket} from "@/util/common/socket";

export default function Header() {
  const router = useRouter();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  function doLogout() {
    const isRemembered = localStorage.getItem("rememberId");

    if (isRemembered === "1") {
      // rememberId, userId 지키고 다른 것만 개별 삭제
      localStorage.removeItem("accessToken");
    } else {
      LocalStorage.clearAll();
    }
    CookieStorage.clearAll();
    disconnectSocket();
    router.push("/login");
  }

  function onClickMenuBurger() {
    setIsMenuVisible((prev) => !prev);
  }

  function onChangeSearch(e: ChangeEvent<HTMLInputElement>): void {
    const {value} = e.target;
    setSearchText(() => value);
  }

  function onClickSearch() {
    router.push("/home/search");
    // 아직 TODO
  }

  useEffect(() => {
    // 메뉴가 열리면 스크롤바 비활성화
    if (isMenuVisible) {
      // 현재 스크롤바 너비 계산
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = "hidden";
      // 스크롤바가 사라지는 만큼 padding으로 보상
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "auto";
      document.body.style.paddingRight = "0";
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      document.body.style.overflow = "auto";
      document.body.style.paddingRight = "0";
    };
  }, [isMenuVisible]);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.iconWrapper}>
          <Link href="/home">
            <img
              src="/ucube-symbol-color.png"
              alt="logo"
              className={styles.symbol}
            />
          </Link>
        </div>

        <Link href="/home">
          <HeaderText />
        </Link>

        <div className={styles.menuWrapper}>
          <InputSearch
            name="search"
            componentType="inHeader"
            onChange={onChangeSearch}
            onClickSearch={onClickSearch}
          />
          <IconImage
            iconName="menu_burger"
            onClick={onClickMenuBurger}
            className={styles.pointer}
            size={22}
            onHoverOpaque
            alt="메뉴"
          />
          <IconImage
            iconName="logout"
            onClick={doLogout}
            className={styles.pointer}
            size={22}
            onHoverOpaque
            alt="로그아웃"
          />
        </div>
      </header>
      {isMenuVisible && (
        <HeaderMenuBar closeMenu={() => setIsMenuVisible(false)} />
      )}
    </>
  );
}
