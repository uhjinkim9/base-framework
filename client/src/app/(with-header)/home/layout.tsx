"use client";
import React, {useState, useEffect} from "react";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";
import {DateCalendar} from "@mui/x-date-pickers/DateCalendar";
import {getDay} from "date-fns";
import {GoMail} from "react-icons/go";
import {GoCalendar} from "react-icons/go";
import {GoChecklist} from "react-icons/go";

import styles from "./layout.module.scss";
import SubTitle from "@/components/common/segment/SubTitle";
import Card from "@/components/common/layout/Card";
import SpaceInCard from "@/components/common/layout/SpaceInCard";
import PushTestButton from "./@attendance/PushTestButton";

export default function HomeLayout({
  attendance,
  announcements,
}: {
  attendance: React.ReactNode;
  announcements: React.ReactNode;
}) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  useEffect(() => {
    setSelectedDate(new Date()); // 클라이언트에서만 `new Date()`를 설정
  }, []);

  return (
    <>
      <main className={styles.main}>
        {/* ***************** 출퇴근 카드 ***************** */}
        <div className={styles.cardcontainerHalf}>{attendance}</div>

        {/* ***************** 일정 카드 ***************** */}
        <div className={styles.cardcontainerHalf}>
          <Card>
            <SpaceInCard>
              <div className={styles["calendar-wrapper"]}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateCalendar
                    value={selectedDate}
                    onChange={(newDate) => setSelectedDate(newDate)}
                    className={styles.calendar}
                    slotProps={{
                      day: (ownerState) => ({
                        sx: {
                          // 요일별 색상 설정
                          color:
                            getDay(ownerState.day) === 0 // 일요일(0)
                              ? "#FF6900"
                              : getDay(ownerState.day) === 6 // 토요일(6)
                              ? "#036EB8"
                              : "inherit",
                          // 선택된 날짜 색상 변경
                          "&.Mui-selected": {
                            backgroundColor: "#000927 !important",
                            color: "white !important",
                          },
                        },
                      }),
                    }}
                  />
                </LocalizationProvider>
              </div>
            </SpaceInCard>
            <SpaceInCard>
              <SubTitle icon={<GoCalendar />}>
                <>일정</>
                <PushTestButton />
              </SubTitle>
              <p>일정 목록</p>
              <p>일정 목록</p>
              <p>일정 목록</p>
              <p>일정 목록</p>
            </SpaceInCard>
          </Card>
        </div>
        {/* ***************** 메일 카드 ***************** */}
        <div className={styles["card-container-full"]}>
          <Card>
            <SpaceInCard>
              <SubTitle icon={<GoMail />}>
                <>메일</>
              </SubTitle>
              <p>메일 목록</p>
              <p>메일 목록</p>
              <p>메일 목록</p>
              <p>메일 목록</p>
            </SpaceInCard>
          </Card>
        </div>

        {/* ***************** 결재 카드 ***************** */}
        <div className={styles.cardcontainerHalf}>
          <Card>
            <SpaceInCard>
              <SubTitle icon={<GoChecklist />}>
                <>결재</>
              </SubTitle>
              <p>결재 목록</p>
              <p>결재 목록</p>
              <p>결재 목록</p>
              <p>결재 목록</p>
            </SpaceInCard>
          </Card>
        </div>

        {/* ***************** 공지 카드 ***************** */}
        <div className={styles.cardcontainerHalf}>{announcements}</div>
      </main>
    </>
  );
}
