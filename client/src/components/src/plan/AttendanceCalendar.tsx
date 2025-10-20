"use client";
import {useEffect, useRef, useState} from "react";
import {requestPost} from "@/util/api/api-service";
import {AttendanceLogType} from "@/types/attendance.type";
import {EventType} from "@/types/plan.type";
import {
  getStatusTitle,
  transformAttendanceToEvents,
} from "./etc/calendar-helper";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";
import FullCalendarComponent from "./FullCalendar";
import useModal from "@/hooks/useModal";
import Modal from "@/components/common/layout/Modal";
import {timeWithMinute} from "@/util/helpers/formatters";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export default function AttendanceCalendar() {
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLogType[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<EventType[]>([]);
  const [fullCalendarEvents, setFullCalendarEvents] = useState<any[]>([]);

  const {openModal, closeModal, modalConfig} = useModal();
  const logRef = useRef<AttendanceLogType | null>(null);

  const [viewRange, setViewRange] = useState<string>("");

  // attendance 데이터를 캘린더 이벤트로 변환
  const transformAttendanceDataToEvents = (attendance: any[]) => {
    return transformAttendanceToEvents(attendance);
  };

  // EventType을 FullCalendar 이벤트로 변환
  const transformToFullCalendarEvents = (events: EventType[]) => {
    return events.map((event) => ({
      id: String(event.id || ""),
      title: event.title || "",
      start: event.start,
      end: event.end,
      allDay: Boolean(event.allDay),
      color: event.color, // transformAttendanceToEvents에서 설정한 색상 사용
      textColor: event.textColor, // transformAttendanceToEvents에서 설정한 텍스트 색상 사용
      extendedProps: event.extendedProps || {},
    }));
  };

  // attendance 전용 eventContent 렌더러
  const renderEventContent = (arg: any) => {
    return (
      <div className="fc-event-custom-content">
        <div>{arg.event.title}</div>
      </div>
    );
  };

  // 이벤트 클릭 핸들러
  const onEventClick = (info: any) => {
    const eventData = info.event.extendedProps;
    console.log("Event clicked:", eventData);

    if (eventData && eventData.logIdx) {
      openModal();
      logRef.current = eventData;
    }
  };

  const getAttendanceLogs = async (viewRange: string) => {
    if (!viewRange) return [];
    const res = await requestPost("/attendance/getAttendanceForCalendar", {
      range: viewRange,
    });

    if (res.statusCode === 200) {
      const attendanceLogs = res.data;
      setAttendanceLogs(attendanceLogs);
    }
    return [];
  };

  useEffect(() => {
    console.log("📅 [attendanceLogs] 데이터 상태", attendanceLogs);
  }, [attendanceLogs]);

  // attendanceLogs 변경시 이벤트 변환
  useEffect(() => {
    const transformedEvents = transformAttendanceDataToEvents(
      attendanceLogs || [],
    );
    setCalendarEvents(transformedEvents);
  }, [attendanceLogs]);

  // calendarEvents 변경시 FullCalendar 이벤트로 변환
  useEffect(() => {
    const fullCalendarEvents = transformToFullCalendarEvents(calendarEvents);
    console.log(
      "📅 [AttendanceCalendar] FullCalendar Events:",
      fullCalendarEvents,
    );
    setFullCalendarEvents(fullCalendarEvents);
  }, [calendarEvents]);

  useEffect(() => {
    if (!viewRange) return;
    getAttendanceLogs(viewRange);
  }, [viewRange]);

  return (
    <>
      <FullCalendarComponent
        events={fullCalendarEvents}
        setViewRange={setViewRange}
        eventContent={renderEventContent}
        onEventClick={onEventClick}
      ></FullCalendarComponent>

      <Modal
        modalConfig={modalConfig}
        closeModal={closeModal}
        modalTitle={"근태 상세"}
        width={"40vw"}
        height={"50vh"}
        // footerContent={
        //   <CommonButtonGroup
        //     usedButtons={{btnSubmit: true}}
        //     onSubmit={onSubmitPlan}
        //   />
        // }
      >
        근태 로그 정보 아래엔 근태 수정 요청 버튼
        {logRef.current && (
          <div>
            <p>{logRef.current.workDate}</p>
            <p>{timeWithMinute(logRef.current.checkInTime || "")}</p>
            <p>
              {timeWithMinute(logRef.current.checkOutTime || "") ??
                "퇴근 시각 없음"}
            </p>
            <p>
              {logRef.current.workMin
                ? `${Math.floor(logRef.current.workMin / 60)}h ${
                    logRef.current.workMin % 60
                  }m`
                : "근무 시간 없음"}
            </p>
            <p>{logRef.current.status}</p>
          </div>
        )}
        {logRef.current && getStatusTitle(
          logRef.current.status || "",
          logRef.current.workDate || "",
          logRef.current.checkInTime || "",
          logRef.current.checkOutTime || "",
        )}
      </Modal>
    </>
  );
}
