"use client";
import {useEffect, useState, useRef} from "react";
import {ContextMenuProvider} from "@/context/ContextMenu";
import {usePlanContext} from "@/context/PlanContext";
import {requestPost} from "@/util/api/api-service";
import {parseXmlToJson} from "@/util/helpers/parseXml";
import {isEmpty, isNotEmpty} from "@/util/validators/check-empty";
import {
  PlanVisibilityTypes,
  PublicHolidayType,
  PlanType,
  PlanTypes,
  RepeatRuleType,
  EventType,
  planTypeMap,
} from "@/types/plan.type";
import {toUTCDateString} from "@/util/helpers/timezone";
import {getContrastTextColor} from "@/util/helpers/color-helper";
import ColoredCircle from "@/components/common/segment/ColoredCircle";
import {useContextMenu} from "@/context/ContextMenu";
import useModal from "@/hooks/useModal";

import PlanAddModal from "@/components/src/plan/modal/PlanAddModal";
import PlanViewModal from "@/components/src/plan/modal/PlanViewModal";
import ContextMenuComponent from "../../common/segment/ContextMenuComponent";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";
import FullCalendarComponent from "./FullCalendar";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export default function Calendar() {
  const {plans, setPlans, planMenus, checkedCalList, planDispatch} =
    usePlanContext();
  const [viewRange, setViewRange] = useState<string>("");
  const [calendarEvents, setCalendarEvents] = useState<EventType[]>([]);
  const [fullCalendarEvents, setFullCalendarEvents] = useState<any[]>([]);
  const {handleContextMenuOpen} = useContextMenu();
  const addNewPlanModal = useModal();
  const showPlanModal = useModal();
  const dateRef = useRef<string | null>(null);

  const menuItems = [
    {type: "schedule", label: "일정"},
    {type: "task", label: "업무"},
    {type: "booking", label: "자원 예약"},
    {type: "dayoff", label: "휴가"},
  ];

  // plan 데이터를 캘린더 이벤트로 변환
  const transformPlanDataToEvents = (plans: any[]) => {
    const filteredPlans = plans?.filter((plan) => {
      const targetKey = String(plan?.planMenu?.menuId ?? plan?.menuIdx ?? "");
      const isChecked = checkedCalList?.some(
        (cal: any) => cal.name === targetKey,
      );
      return isChecked;
    });

    return (
      filteredPlans?.map((plan) => {
        // 기존 plan 변환 로직
        const startedAt =
          plan?.isAllday && plan?.startedAt
            ? plan.startedAt.split("T")[0]
            : plan?.startedAt || null;
        const endedAt =
          plan?.isAllday && plan?.endedAt
            ? plan.endedAt.split("T")[0]
            : plan?.endedAt || null;

        const holidayMenuId = "public-holiday";
        const menuColor = plan?.planMenu?.menuColor || "#FF6900";

        const event = {
          id:
            isEmpty(plan?.planIdx) && plan?.planMenu?.menuId === holidayMenuId
              ? `holiday-${plan?.locdate}`
              : String(plan?.planIdx ?? ""),
          title: plan?.title ?? plan?.dateName ?? "",
          start: startedAt,
          end: endedAt,
          color: menuColor,
          textColor: getContrastTextColor(menuColor),
          extendedProps: plan,
        };
        return event;
      }) || []
    );
  };

  const getPlans = async (viewRange: string) => {
    if (!viewRange) return [];
    const res = await requestPost("/plan/getPlans", {
      range: viewRange,
    });

    if (res.statusCode === 200) {
      const plans = res.data;
      const updated = plans.map((prev: any) => ({
        ...prev,
        menuIdx: String(prev.menuIdx),
        planMenu: {
          ...prev.planMenu,
          menuIdx: String(prev.planMenu.menuIdx),
        },
      }));
      return updated;
    }
    return [];
  };

  useEffect(() => {
    console.log("📅 [getPlans] 일정 데이터 상태", plans);
  }, [plans]);

  // plans나 checkedCalList 변경시 이벤트 변환
  useEffect(() => {
    const transformedEvents = transformPlanDataToEvents(plans || []);
    console.log("📅 [Calendar] Transformed Events:", transformedEvents);
    setCalendarEvents(transformedEvents);
  }, [plans, checkedCalList]);

  // calendarEvents 변경시 FullCalendar 이벤트로 변환
  useEffect(() => {
    const fullCalendarEvents = transformToFullCalendarEvents(calendarEvents);
    console.log("📅 [Calendar] FullCalendar Events:", fullCalendarEvents);
    setFullCalendarEvents(fullCalendarEvents);
  }, [calendarEvents]);

  useEffect(() => {
    if (!viewRange) return;
    if (!planMenus?.public) return; // planMenus 로드 대기

    (async () => {
      const [planRes, holidayRes] = await Promise.all([
        getPlans(viewRange),
        getPublicHolidays(viewRange),
      ]);
      setPlans([...planRes, ...(holidayRes ?? [])]);
    })();
  }, [viewRange, planMenus]);

  const getPublicHolidays = async (
    viewRange: string,
  ): Promise<PublicHolidayType[]> => {
    const startDateStr = viewRange?.split("~")[0];
    const endDateStr = viewRange?.split("~")[1];

    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;

    if (startDate && endDate) {
      const diffMs = endDate.getTime() - startDate.getTime();
      // ms → 일(day)로 변환, +10은 전월 인식 방지용으로 10일 더한 것
      const diffDays = diffMs / (1000 * 60 * 60 * 24) + 10;

      // | 구분   | 판별 기준 (대략)                       |
      // | ----- | ------------------------------------- |
      // | week  | 7일 ≒ 604,800,000ms                   |
      // | month | 약 35\~40일 ≒ 2,678,400,000ms (6주치)  |
      // | year  | 약 365일 ≒ 31,536,000,000ms           |

      let rangeType: "week" | "month" | "year";
      if (diffDays <= 8) {
        rangeType = "week";
      } else if (diffDays <= 45) {
        rangeType = "month";
      } else {
        rangeType = "year";
      }

      if (rangeType === "week" || rangeType === "month") {
        const year = startDate.getFullYear();
        const month = startDate.getMonth() + 1;
        const res = await requestPost("/plan/getPublicHolidays", {year, month});
        if (!res) return [];

        const parsed = parseXmlToJson(res);
        const items = parsed?.response?.body?.items?.item;

        return transformPublicHolidays(items);
      } else if (rangeType === "year") {
        // 연도 뷰에서는 공휴일 표시하지 않음 (성능 최적화)
        // 필요시 월 단위로 캘린더를 이동하면서 확인 가능
        console.log(
          "📅 [getPublicHolidays] 연도 뷰에서는 공휴일을 표시하지 않습니다.",
        );
        return [];
      }
    }
    return [];
  };

  const transformPublicHolidays = (rawItems: any[]): PublicHolidayType[] => {
    if (isEmpty(rawItems)) return [];

    const holidayMenuId = "public-holiday";
    const holidayMenuIdx = planMenus?.public?.find(
      (cal) => cal.menuId === holidayMenuId,
    )?.menuIdx;

    return rawItems.map((item) => ({
      planType: "holiday" as const,
      menuIdx: holidayMenuIdx,
      planMenu: {
        menuIdx: holidayMenuIdx,
        menuId: holidayMenuId,
        menuColor: item?.isHoliday === "Y" ? "#D30000" : "#129635",
      },
      title: item?.dateName,
      startedAt: dayjs
        .utc(String(item?.locdate), "YYYYMMDD")
        .format("YYYY-MM-DDT00:00:00"),
      endedAt: dayjs
        .utc(String(item?.locdate), "YYYYMMDD")
        .format("YYYY-MM-DDT23:59:59"),
      visibility: PlanVisibilityTypes.PRIVATE,
      isAllday: true,
      ...item,
    }));
  };

  // EventType을 FullCalendar 이벤트로 변환
  const transformToFullCalendarEvents = (events: EventType[]) => {
    return events.map((event) => {
      const eventData = event.extendedProps;
      const isRepeated = eventData?.isRepeated && eventData?.repeatRule;
      const isTask = eventData?.planType === "task";

      const baseEvent = {
        id: event.id !== undefined ? String(event.id) : undefined,
        color: event.color,
        title: event.title,
        textColor: event.textColor,
        extendedProps: eventData,
        durationEditable: !isTask, // 리사이즈 불가 설정
      };

      if (isRepeated) {
        const rule = eventData.repeatRule;

        return {
          ...baseEvent,
          rrule: {
            freq: rule.freq,
            interval: rule.interval,
            count: rule.repeatEndType === "count" ? rule.count : undefined,
            until:
              rule.repeatEndType === "until" && rule.until
                ? dayjs(rule.until).toISOString()
                : undefined,
            dtstart: eventData.startedAt,
          },
          duration: eventData.isAllday
            ? {days: 1} // 핵심! 종일 반복 이벤트는 duration을 days로!
            : new Date(eventData.endedAt).getTime() -
              new Date(eventData.startedAt).getTime(),
          allDay: eventData.isAllday,
        };
      } else {
        return {
          ...baseEvent,
          start: eventData?.startedAt,
          end: eventData?.endedAt,
          allDay: eventData?.isAllday,
        };
      }
    });
  };

  // plan 전용 eventContent 렌더러
  const renderEventContent = (arg: any) => {
    const eventData = arg.event.extendedProps;
    const plan = eventData;
    const planType = plan?.planType as PlanTypes;
    const menuColor = plan?.planMenu?.menuColor;
    const menuNm = plan?.planMenu?.menuNm;

    const typeKor = planTypeMap[planType];

    return (
      <div className="fc-event-custom-content">
        {!plan.isAllday && <ColoredCircle colorCode={menuColor ?? "#000"} />}
        <b>
          [{menuNm ? `${menuNm}/` : ""}
          {typeKor}]
        </b>
        <div>{arg.event.title}</div>
      </div>
    );
  };

  // 컴텍스트메뉴 핸들러
  const handleClickContextMenu = (type: string) => {
    planDispatch({
      type: "RESET",
      payload: {
        startedAt: dateRef.current,
        endedAt: dateRef.current
          ? dayjs(dateRef.current).add(1, "hour").toISOString()
          : dateRef.current,
      },
    });
    planDispatch({
      type: "UPDATE_PLAN_FIELD",
      payload: {
        name: "planType",
        value: type as PlanTypes,
      },
    });
    addNewPlanModal.openModal();
  };

  // 컴텍스트메뉴 오픈 핸들러
  const handleContextMenu = (e: MouseEvent, dateRefValue: string | null) => {
    dateRef.current = dateRefValue;
    // @ts-expect-error: Accept native MouseEvent for context menu
    handleContextMenuOpen(e);
  };

  // 이벤트 클릭 핸들러
  const handleEventClick = (info: any) => {
    const eventData = info.event.extendedProps;

    if (eventData && eventData.planIdx) {
      planDispatch({type: "RESET"});
      planDispatch({
        type: "SET_SELECTED",
        payload: eventData.planIdx,
      });
      showPlanModal.openModal();
    }
  };

  // 데이터 새로고침 함수
  const refreshPlanData = async () => {
    if (viewRange && planMenus?.public) {
      const [planRes, holidayRes] = await Promise.all([
        getPlans(viewRange),
        getPublicHolidays(viewRange),
      ]);
      setPlans([...planRes, ...(holidayRes ?? [])]);
    }
  };

  // plan 이동 처리 함수들
  async function onMovePlan(
    planIdx: number,
    planType: string,
    startedAt: string,
    endedAt: string,
    repeatRule: RepeatRuleType,
  ) {
    const plan = {
      planIdx,
      planType: planType as PlanTypes,
      startedAt,
      endedAt,
    };
    await onSubmitPlan(plan, repeatRule);
  }

  async function onSubmitPlan(plan: PlanType, repeatRule: RepeatRuleType) {
    const payload: any = {
      plan,
      planType: plan.planType,
    };

    if (isNotEmpty(repeatRule)) {
      payload.repeatRule = repeatRule;
    }

    const res = await requestPost("/plan/createOrUpdatePlan", payload);
    if (res.statusCode === 200) {
      await refreshPlanData();
    } else {
      alert("이동ㄴㄴ");
    }
  }

  // 이벤트 드롭 핸들러
  const handleEventDrop = (info: any) => {
    const {planIdx, planType, isRepeated, rrule} = info.event.extendedProps;
    const {start, end} = info.event;
    const repeatRule = isRepeated ? rrule : null;

    if (!start || !end) {
      alert("이동 일자 선택에 오류가 있습니다.");
      return;
    }

    onMovePlan(
      planIdx,
      planType,
      toUTCDateString(start.toISOString()),
      toUTCDateString(end.toISOString()),
      repeatRule,
    );
  };

  // 이벤트 리사이즈 핸들러
  const handleEventResize = (info: any) => {
    const {planIdx, planType, isRepeated, rrule} = info.event.extendedProps;
    const {start, end} = info.event;
    const repeatRule = isRepeated ? rrule : null;

    if (!start || !end) {
      alert("이동 일자 선택에 오류가 있습니다.");
      return;
    }

    onMovePlan(
      planIdx,
      planType,
      toUTCDateString(start.toISOString()),
      toUTCDateString(end.toISOString()),
      repeatRule,
    );
  };

  // 날짜 클릭 핸들러
  const handleDateClick = (info: any) => {
    console.log("날짜 클릭:", info.dateStr);
    // 필요시 plan 생성 모달 열기 등의 로직 추가 가능
  };

  return (
    <>
      <ContextMenuProvider>
        <FullCalendarComponent
          events={fullCalendarEvents}
          setViewRange={setViewRange}
          onEventClick={handleEventClick}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          onDateClick={handleDateClick}
          onContextMenu={handleContextMenu}
          eventContent={renderEventContent}
        />
        <PlanAddModal addNewPlanModal={addNewPlanModal} />
        <PlanViewModal showPlanModal={showPlanModal} />
        <ContextMenuComponent
          handleClickContextMenu={handleClickContextMenu}
          menuItems={menuItems}
        />
      </ContextMenuProvider>
    </>
  );
}
