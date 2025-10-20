"use client";
import React, {useEffect, useRef, JSX} from "react";

import "./styles/FullCalendar.scss"; // FullCalendar 스타일
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import multiMonthPlugin from "@fullcalendar/multimonth";
import interactionPlugin from "@fullcalendar/interaction"; // DnD용
import rrulePlugin from "@fullcalendar/rrule"; // 고급 반복 기능 플러그인
import dayjs from "dayjs";

type PropType = {
  events: any[]; // 완전히 변환된 FullCalendar 이벤트 객체
  setViewRange?: React.Dispatch<React.SetStateAction<string>>;
  onEventClick?: (info: any) => void; // 이벤트 클릭 콜백
  onEventDrop?: (info: any) => void; // 이벤트 드롭 콜백
  onEventResize?: (info: any) => void; // 이벤트 리사이즈 콜백
  onDateClick?: (info: any) => void; // 날짜 클릭 콜백
  onContextMenu?: (e: MouseEvent, dateRef: string | null) => void; // 컴텍스트메뉴 콜백
  eventContent?: (arg: any) => JSX.Element; // 커스텀 이벤트 렌더링
};

export default function FullCalendarComponent({
  events,
  setViewRange,
  onEventClick,
  onEventDrop,
  onEventResize,
  onDateClick,
  onContextMenu,
  eventContent,
}: PropType) {
  const dateRef = useRef<string | null>(null);

  // 커스텀 이벤트 추가: 우클릭 컨텍스트 메뉴
  useEffect(() => {
    const dayCells = document.querySelectorAll(".fc-daygrid-day");
    const timeCells = document.querySelectorAll(".fc-timegrid-slot");
    const dateCells = [...dayCells, ...timeCells]; // 배열로 병합

    const contextMenuEventRegister = (e: MouseEvent) => {
      e.preventDefault();
      const target = e.currentTarget as HTMLElement;
      const dateStr = target.dataset.date;
      const timeStr = target.dataset.time;
      const currentTime = dayjs(); // 현재 시각 기준

      if (!dateStr && timeStr) {
        // 주 캘린더
        const [hour, minute] = timeStr.split(":");

        dateRef.current = dayjs(
          `${currentTime.format("YYYY-MM-DD")}T${hour}:${minute}`,
        ).toISOString();
      } else if (dateStr && !timeStr) {
        // 월, 연 캘린더
        dateRef.current = dayjs(
          `${dateStr}T${currentTime.format("HH:mm")}`,
        ).toISOString();
      }

      onContextMenu?.(e, dateRef.current);
    };

    dateCells.forEach((cell) => {
      // @ts-expect-error: Accept native MouseEvent for context menu
      cell.addEventListener("contextmenu", contextMenuEventRegister);
    });
    // cleanup: 컴포넌트 언마운트 시 리스너 제거
    return () => {
      dateCells.forEach((cell) => {
        // @ts-expect-error: Accept native MouseEvent for context menu
        cell.removeEventListener("contextmenu", contextMenuEventRegister);
      });
    };
  }, [onContextMenu]);

  return (
    <>
      <FullCalendar
        headerToolbar={{
          start: "timeGridWeek,dayGridMonth,multiMonthYear",
          center: "prev title next",
          end: "today",
        }}
        buttonText={{
          today: "오늘",
          month: "월",
          week: "주",
          year: "연",
        }}
        locale="ko"
        dayMaxEventRows={true} // 일별 최대 이벤트 줄 수 제한
        dayMaxEvents={2} // 하루에 최대 3개까지만 보여주고 +n으로 처리
        moreLinkClick="popover" // (선택) 클릭 시 팝업으로 표시
        plugins={[
          dayGridPlugin,
          timeGridPlugin,
          multiMonthPlugin,
          interactionPlugin,
          rrulePlugin,
        ]}
        initialView="dayGridMonth"
        datesSet={(arg) => {
          const mappedRange = `${arg.startStr}~${arg.endStr}`;
          setViewRange && setViewRange(mappedRange);
        }}
        eventAllow={(dropInfo, draggedEvent) => {
          if (!draggedEvent) return false;
          return draggedEvent.extendedProps.type !== "attendance";
        }}
        editable={true} // DnD 허용
        selectable={true} // 클릭 영역 선택 허용
        events={events}
        dateClick={onDateClick}
        eventContent={eventContent}
        eventClick={onEventClick}
        eventDrop={onEventDrop}
        eventResize={onEventResize}
        eventDidMount={(info) => {
          // 월간 뷰에서는 근태 이벤트를 종일로 표시 (색 유지)
          if (
            info.view.type === "dayGridMonth" &&
            info.event.extendedProps.type === "attendance"
          ) {
            info.el.style.backgroundColor =
              info.event.backgroundColor || "#2196F3";
            info.el.style.color = "#fff";
            info.el.style.border = "none";
          }
        }}
      />
    </>
  );
}
