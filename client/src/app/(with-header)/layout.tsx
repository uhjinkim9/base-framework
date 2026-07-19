"use client";
import styles from "./layout.module.scss";

import {MenuProvider} from "@/context/MenuContext";
import {UserProvider} from "@/context/UserContext";
import {PlanProvider} from "@/context/PlanContext";
import {AlertProvider} from "@/context/AlertContext";

import Header from "@/components/common/layout/Header";

import AlertPortal from "@/portals/AlertPortal";

export default function CommonLayout({children}: {children: React.ReactNode}) {
  return (
    <>
      <AlertProvider>
        <UserProvider>
          <MenuProvider>
            <PlanProvider>
              <AlertPortal />
              <main className={styles.main}>
                <Header></Header>
                {children}
              </main>
            </PlanProvider>
          </MenuProvider>
        </UserProvider>
      </AlertProvider>
    </>
  );
}
