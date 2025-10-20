"use client";
import clsx from "clsx";
import style from "./styles/AttendanceStatus.module.scss";
import AlertService from "@/services/alert.service";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";
import weekOfYear from "dayjs/plugin/weekOfYear";
import Card from "@/components/common/layout/Card";
import SpaceInCard from "@/components/common/layout/SpaceInCard";
import PieChartComponent from "@/components/common/data-display/PieChart";
import BarChartVertical from "@/components/common/data-display/BarChartVertical";
import IconNode from "@/components/common/segment/IconNode";

import {useEffect, useState, useMemo} from "react";
import {requestPost} from "@/util/api/api-service";
import {DashboardData} from "@/types/attendance.type";
import LoadingSpinner from "@/components/common/feedback/LoadingSpinner";
import Tooltip from "@/components/common/segment/Tooltip";
import {getTodayDateWithHyphen} from "@/util/helpers/formatters";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(weekOfYear);

export default function AttendanceStatus() {
  // 범위 상태 관리
  const [ranges, setRanges] = useState({
    dateRange: dayjs().format("YYYY-MM-DD"),
    weekRange: `${dayjs().startOf("week").format("YYYY-MM-DD")} ~ ${dayjs()
      .endOf("week")
      .format("YYYY-MM-DD")}`,
    monthRange: dayjs().month() + 1, // 1~12 숫자
  });

  // 대시보드 데이터 상태
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );

  // 일간 범위 변경 핸들러
  const shiftDateRange = (direction: number) => {
    const currentDate = dayjs(ranges.dateRange);
    const newDate = currentDate.add(direction, "day");
    setRanges((prev) => ({
      ...prev,
      dateRange: newDate.format("YYYY-MM-DD"),
    }));
  };

  // 주간 범위 변경 핸들러
  const shiftWeekRange = (direction: number) => {
    const [startStr] = ranges.weekRange.split(" ~ ");
    const currentStart = dayjs(startStr.trim());
    const newStart = currentStart.add(direction, "week");
    const newEnd = newStart.endOf("week");
    setRanges((prev) => ({
      ...prev,
      weekRange: `${newStart.format("YYYY-MM-DD")} ~ ${newEnd.format(
        "YYYY-MM-DD",
      )}`,
    }));
  };

  // 월간 범위 변경 핸들러
  const shiftMonthRange = (direction: number) => {
    const currentMonth = ranges.monthRange; // 1~12
    let newMonth = currentMonth + direction;

    // 월 범위 제한 (1~12)
    if (newMonth < 1) newMonth = 1;
    if (newMonth > 12) newMonth = 12;

    setRanges((prev) => ({
      ...prev,
      monthRange: newMonth,
    }));
  };

  // 근무시간을 시간:분 형식으로 변환
  const formatTime = (time: string) => {
    if (!time || time === "00:00") return "0h 00m";
    const [hours, minutes] = time.split(":");
    return `${hours}h ${minutes}m`;
  };

  // 근무시간을 숫자로 변환 (차트용)
  const parseTimeToHours = (time: string): number => {
    if (!time) return 0;
    const [hours, minutes] = time.split(":").map(Number);
    return hours + minutes / 60;
  };

  const getAttendanceDashBoardData = async () => {
    try {
      const param = {
        rangeDate: ranges.dateRange,
        rangeWeek: ranges.weekRange.replace(/ /g, ""), // 공백 제거
        rangeMonth: ranges.monthRange, // 숫자 그대로 전달
      };
      const res = await requestPost(
        "/attendance/getAttendanceDashBoardData",
        param,
      );
      if (res.statusCode === 200) {
        console.log("응답 성공 데이터:", res.data);
        setDashboardData(res.data);
      } else {
        AlertService.error(
          `근태 대시보드 조회에 실패했습니다: ${
            res.message || "알 수 없는 오류"
          }`,
        );
      }
    } catch (error) {
      console.error("getAttendanceDashBoardData 에러:", error);
      AlertService.error("근태 대시보드 조회 중 오류가 발생했습니다.");
    }
  };

  // 범위 변경 시 데이터 다시 조회
  useEffect(() => {
    console.log("ranges 변경됨:", ranges);
    getAttendanceDashBoardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ranges.dateRange, ranges.weekRange, ranges.monthRange]);

  // 오늘 차트 데이터 (메모이제이션)
  const dataBarToday = useMemo(() => {
    const dayWorkHours = parseTimeToHours(
      dashboardData?.dayWorkTime || "00:00",
    );

    // dateRange와 오늘이 동일한지 확인
    const isToday = ranges.dateRange === getTodayDateWithHyphen();

    return [
      {
        id: "today",
        // name: isToday ? "오늘" : undefined, // 오늘이면 "오늘", 아니면 name 제거
        value: dayWorkHours,
        label: formatTime(dashboardData?.dayWorkTime || ""), // "07h 23m" (라벨용)
      },
    ];
  }, [dashboardData?.dayWorkTime, ranges.dateRange]);

  // 주간 차트 데이터 (메모이제이션)
  const {dataPie, weekPercent} = useMemo(() => {
    const weekWorkedHours = parseTimeToHours(
      dashboardData?.weekWorkTime || "00:00",
    );
    const weekRemainHours = parseTimeToHours(
      dashboardData?.weekRemainedWorkTime || "00:00",
    );
    const weekTotalHours = weekWorkedHours + weekRemainHours;
    const percent =
      weekTotalHours > 0
        ? Math.floor((weekWorkedHours / weekTotalHours) * 100)
        : 0;

    return {
      dataPie: [
        {id: "work", name: "근무", value: weekWorkedHours},
        {id: "remain", name: "잔여", value: weekRemainHours},
      ],
      weekPercent: percent,
    };
  }, [dashboardData?.weekWorkTime, dashboardData?.weekRemainedWorkTime]);

  // 월간 차트 데이터 (메모이제이션)
  const dataBar = useMemo(() => {
    // 실제 주차별 데이터 사용
    const week1Hours = parseTimeToHours(
      dashboardData?.week1WorkTime || "00:00",
    );
    const week2Hours = parseTimeToHours(
      dashboardData?.week2WorkTime || "00:00",
    );
    const week3Hours = parseTimeToHours(
      dashboardData?.week3WorkTime || "00:00",
    );
    const week4Hours = parseTimeToHours(
      dashboardData?.week4WorkTime || "00:00",
    );
    const week5Hours = parseTimeToHours(
      dashboardData?.week5WorkTime || "00:00",
    );

    return [
      {
        id: "1",
        name: "1주차",
        value: week1Hours,
        label: formatTime(dashboardData?.week1WorkTime || "00:00"),
      },
      {
        id: "2",
        name: "2주차",
        value: week2Hours,
        label: formatTime(dashboardData?.week2WorkTime || "00:00"),
      },
      {
        id: "3",
        name: "3주차",
        value: week3Hours,
        label: formatTime(dashboardData?.week3WorkTime || "00:00"),
      },
      {
        id: "4",
        name: "4주차",
        value: week4Hours,
        label: formatTime(dashboardData?.week4WorkTime || "00:00"),
      },
      {
        id: "5",
        name: "5주차",
        value: week5Hours,
        label: formatTime(dashboardData?.week5WorkTime || "00:00"),
      },
    ];
  }, [
    dashboardData?.week1WorkTime,
    dashboardData?.week2WorkTime,
    dashboardData?.week3WorkTime,
    dashboardData?.week4WorkTime,
    dashboardData?.week5WorkTime,
  ]);

  // 로딩 중이거나 데이터 없을 때
  if (!dashboardData) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <div className={style.container}>
        <div className={style.containerLeft}>
          <Card>
            <SpaceInCard>
              <div className={style.shift}>
                <IconNode
                  iconName="chevronLeft"
                  size={20}
                  onClick={() => shiftDateRange(-1)}
                  color="gray5"
                  cursorPointer
                />
                <span className={style.date}>{ranges.dateRange}</span>
                <IconNode
                  iconName="chevronRight"
                  size={20}
                  onClick={() => shiftDateRange(1)}
                  color="gray5"
                  cursorPointer
                />
              </div>
              <BarChartVertical
                data={dataBarToday}
                maxValue={8}
                barColor="#1b9510"
                overtimeColor="#ff6900"
                backgroundColor="#eeeeee"
                showGrid={false}
                showLabel={true}
                showTooltip={false}
                axisLine={false}
                tickLine={false}
                barSize={30}
                width={"24rem"}
                height={"9rem"}
              />
              <ul className={style.statusList}>
                <li className={style.statusRow}>
                  <div className={style.labelWrapper}>
                    <span className={style.label}>출근 시각</span>
                  </div>
                  <span className={style.subTextBlack}>
                    {dashboardData.checkInTime || "-"}
                  </span>
                </li>
                <li className={style.statusRow}>
                  <div className={style.labelWrapper}>
                    <span className={style.label}>퇴근 시각</span>
                  </div>
                  <span className={style.subTextBlack}>
                    {dashboardData.checkOutTime || "-"}
                  </span>
                </li>
                <li className={style.statusRow}>
                  <div className={style.labelWrapper}>
                    <span className={style.label}>오늘 근로</span>
                  </div>
                  <span className={style.subTextBlack}>
                    {formatTime(dashboardData.dayWorkTime)}
                  </span>
                </li>
                <li className={style.statusRow}>
                  <div className={style.labelWrapper}>
                    <span className={style.label}>잔여 근로</span>
                  </div>
                  <span className={style.subTextBlack}>
                    {formatTime(dashboardData.dayRemainedWorkTime)}
                  </span>
                </li>
                <li className={style.statusRow}>
                  <div className={style.labelWrapper}>
                    <span className={style.label}>초과 근로</span>
                  </div>
                  <span className={style.subTextBlack}>
                    {formatTime(dashboardData.dayOverWorkTime)}
                  </span>
                </li>
              </ul>
            </SpaceInCard>
          </Card>

          <Card>
            <SpaceInCard>
              <div className={style.shift}>
                <IconNode
                  iconName="chevronLeft"
                  size={20}
                  onClick={() => shiftWeekRange(-1)}
                  color="gray5"
                  cursorPointer
                />
                <span className={style.date}>{ranges.weekRange}</span>
                <IconNode
                  iconName="chevronRight"
                  size={20}
                  onClick={() => shiftWeekRange(1)}
                  color="gray5"
                  cursorPointer
                />
              </div>
              <PieChartComponent
                data={dataPie}
                colors={["#ff6900", "#eeeeee"]}
                type="donut"
                showTooltip={false}
              >
                {/* 중앙 텍스트 */}
                <div className={style.donutTextWrapper}>
                  <div className={style.subTextBlack}>
                    {formatTime(dashboardData.weekWorkTime)}
                  </div>
                  <div className={style.subTextGray}>{weekPercent}%</div>
                </div>
              </PieChartComponent>
              <ul className={style.statusList}>
                <li className={style.statusRow}>
                  <div className={style.labelWrapper}>
                    <span className={style.label}>주간 근로</span>
                  </div>
                  <span className={style.subTextBlack}>
                    {formatTime(dashboardData.weekWorkTime)}
                  </span>
                </li>
                <li className={style.statusRow}>
                  <div className={style.labelWrapper}>
                    <span className={style.label}>잔여 근로</span>
                  </div>
                  <span className={style.subTextBlack}>
                    {formatTime(dashboardData.weekRemainedWorkTime)}
                  </span>
                </li>
                <li className={style.statusRow}>
                  <div className={style.labelWrapper}>
                    <span className={style.label}>초과 근로</span>
                  </div>
                  <span className={style.subTextBlack}>
                    {formatTime(dashboardData.weekOverWorkTime)}
                  </span>
                </li>
              </ul>
            </SpaceInCard>
          </Card>
        </div>

        <div className={style.containerRight}>
          <Card>
            <SpaceInCard>
              <div className={style.shift}>
                <IconNode
                  iconName="chevronLeft"
                  size={20}
                  onClick={() => shiftMonthRange(-1)}
                  color="gray5"
                  cursorPointer
                />
                <span className={style.date}>{ranges.monthRange}월</span>
                <IconNode
                  iconName="chevronRight"
                  size={20}
                  onClick={() => shiftMonthRange(1)}
                  color="gray5"
                  cursorPointer
                />
              </div>
              <BarChartVertical
                data={dataBar}
                barColor="#1b9510"
                overtimeColor="#ff6900"
                backgroundColor="#eeeeee"
                showGrid={false}
                showLabel={true}
                showTooltip={false}
                axisLine={false}
                tickLine={false}
                barSize={30}
              />
              <ul className={style.statusList}>
                <li className={style.statusRow}>
                  <div className={style.labelWrapper}>
                    <span className={style.label}>월간 근로</span>
                  </div>
                  <span className={style.subTextBlack}>
                    {formatTime(dashboardData.monthWorkTime)}
                  </span>
                </li>
                <li className={style.statusRow}>
                  <div className={style.labelWrapper}>
                    <span className={style.label}>잔여 근로</span>
                  </div>
                  <span className={style.subTextBlack}>
                    {formatTime(dashboardData.monthRemainedWorkTime)}
                  </span>
                </li>
                <li className={style.statusRow}>
                  <div className={style.labelWrapper}>
                    <span className={style.label}>초과 근로</span>
                  </div>
                  <span className={style.subTextBlack}>
                    {formatTime(dashboardData.monthOverWorkTime)}
                  </span>
                </li>
                <li className={style.statusRow}>
                  <div className={style.labelWrapper}>
                    <span className={style.label}>결근</span>
                  </div>
                  <span className={style.subTextBlack}>
                    <Tooltip
                      text={
                        dashboardData.absentDate.length > 0 ? (
                          dashboardData.absentDate.map((date, index) => (
                            <p key={index}>{date}</p>
                          ))
                        ) : (
                          <span>결근 내역이 없습니다</span>
                        )
                      }
                      position="bottom"
                    >
                      {dashboardData.absentCount}회
                    </Tooltip>
                  </span>
                </li>
                <li className={style.statusRow}>
                  <div className={style.labelWrapper}>
                    <span className={style.label}>지각</span>
                  </div>
                  <span className={style.subTextBlack}>
                    <Tooltip
                      text={
                        dashboardData.lateDate.length > 0 ? (
                          dashboardData.lateDate.map((date, index) => (
                            <p key={index}>{date}</p>
                          ))
                        ) : (
                          <span>지각 내역이 없습니다</span>
                        )
                      }
                      position="bottom"
                    >
                      {dashboardData.lateCount}회
                    </Tooltip>
                  </span>
                </li>
              </ul>
            </SpaceInCard>
          </Card>
        </div>
      </div>
    </>
  );
}
