"use client";
import {useEffect, useState} from "react";
import {
  getDateNumber,
  toKSTDateString,
  toUTCDateString,
} from "@/util/helpers/timezone";
import dayjs from "dayjs";

import AlertService from "@/services/alert.service";
import {isEmpty} from "@/util/validators/check-empty";
import {requestPost} from "@/util/api/api-service";
import {LocalStorage} from "@/util/common/storage";
import {getLastDayOfMonth} from "@/components/src/plan/etc/calendar-helper";

import {
  CalendarSelectOptionType,
  PlanType,
  PlanTypes,
  RepeatRuleType,
  RepeatEndTypes,
} from "@/types/plan.type";
import {SideBarMenuType} from "@/types/menu.type";
import {usePlanContext} from "@/context/PlanContext";

import Modal from "@/components/common/layout/Modal";
import PlanAddModalHeader from "./PlanAddModalHeader";
import CommonButtonGroup from "@/components/common/segment/CommonButtonGroup";
import AddNewSchedule from "./AddNewSchedule";
import AddNewTask from "./AddNewTask";
import AddNewDayOff from "./AddNewDayOff";
import AddNewBooking from "./AddNewBooking";

export default function PlanAddModal({
  addNewPlanModal,
}: {
  addNewPlanModal: any;
}) {
  const {
    planState,
    planDispatch,
    scheduleState,
    scheduleDispatch,
    taskState,
    taskDispatch,
    dayoffState,
    dayoffDispatch,
    repeatRuleState,
    repeatRuleDispatch,
    setPlans,
    planMenus,
  } = usePlanContext();
  const {plan, mode, selected} = planState;

  // 일정 추가 시 캘린더 그룹 셀렉트박스 옵션
  const [calendarGroup, setCalendarGroup] = useState<
    CalendarSelectOptionType[]
  >([]);

  const getPlanMenus = async () => {
    const cals = planMenus?.private ?? [];
    const transformed = transformToSelectOptions(cals);
    setCalendarGroup(transformed);
  };

  function transformToSelectOptions(
    calendars: SideBarMenuType[],
  ): CalendarSelectOptionType[] {
    return calendars.map((cal) => ({
      label: cal.menuNm ?? "",
      value: String(cal.menuIdx),
    }));
  }

  useEffect(() => {
    getPlanMenus();
  }, [planMenus]);

  const validationCheck = () => {
    if (isEmpty(plan.menuIdx)) {
      alert("일정 그룹을 선택해주세요.");
      return false;
    }
    return true;
  };

  // 공통 핸들러: 일정 기본 필드 변경 핸들러
  function onChangeNewPlan(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const {name, value} = e.target;

    const currentValue = plan[name as keyof PlanType];
    if (currentValue === value) return;
    let updateVal: any = value;

    // 캘린더 그룹 선택 처리
    if (name === "menuIdx") {
      const selectedCalendar = calendarGroup.find((c) => c.value === value);
      if (selectedCalendar) {
        // menuIdx와 planMenu 객체 모두 업데이트
        planDispatch({
          type: "UPDATE_PLAN_FIELD",
          payload: {name: "menuIdx", value: value},
        });
        planDispatch({
          type: "UPDATE_PLAN_FIELD",
          payload: {
            name: "planMenu",
            value: {
              menuIdx: value,
            },
          },
        });
      }
      return;
    }

    if (name === "startedAt" || name === "endedAt") {
      // 날짜 값은 UTC로 변환 저장
      updateVal = toUTCDateString(value);
    }

    planDispatch({
      type: "UPDATE_PLAN_FIELD",
      payload: {name: name as keyof PlanType, value: updateVal},
    });
  }

  function onChangeRepeatRule(e: React.ChangeEvent<any>) {
    const {name, value, checkValue} = e.target;
    const currentStart = plan.startedAt;

    if (name === "freq") {
      repeatRuleDispatch({
        type: "UPDATE_REPEAT_RULE_FIELD",
        payload: {name: "freq", value: checkValue},
      });

      // freq 변경 시 repeatEndType 기본값 설정
      repeatRuleDispatch({
        type: "UPDATE_REPEAT_RULE_FIELD",
        payload: {name: "repeatEndType", value: RepeatEndTypes.NEVER},
      });

      if (
        checkValue === "MONTHLY" &&
        currentStart &&
        dayjs(currentStart).isValid()
      ) {
        repeatRuleDispatch({
          type: "UPDATE_REPEAT_RULE_FIELD",
          payload: {name: "byweekday", value: null},
        });
        repeatRuleDispatch({
          type: "UPDATE_REPEAT_RULE_FIELD",
          payload: {name: "byyearday", value: null},
        });
        repeatRuleDispatch({
          type: "UPDATE_REPEAT_RULE_FIELD",
          payload: {
            name: "bymonthday",
            value: dayjs(currentStart).date().toString(),
          },
        });
      } else if (
        checkValue === "WEEKLY" &&
        currentStart &&
        dayjs(currentStart).isValid()
      ) {
        const weekdayNumber = dayjs(currentStart).day();
        repeatRuleDispatch({
          type: "UPDATE_REPEAT_RULE_FIELD",
          payload: {name: "bymonthday", value: null},
        });
        repeatRuleDispatch({
          type: "UPDATE_REPEAT_RULE_FIELD",
          payload: {name: "byyearday", value: null},
        });
        repeatRuleDispatch({
          type: "UPDATE_REPEAT_RULE_FIELD",
          payload: {name: "byweekday", value: weekdayNumber},
        });
      } else if (
        checkValue === "YEARLY" &&
        currentStart &&
        dayjs(currentStart).isValid()
      ) {
        repeatRuleDispatch({
          type: "UPDATE_REPEAT_RULE_FIELD",
          payload: {name: "bymonthday", value: null},
        });
        repeatRuleDispatch({
          type: "UPDATE_REPEAT_RULE_FIELD",
          payload: {name: "byweekday", value: null},
        });
        repeatRuleDispatch({
          type: "UPDATE_REPEAT_RULE_FIELD",
          payload: {
            name: "byyearday",
            value: dayjs(currentStart).date().toString(),
          },
        });
      }
    }

    // 말일 선택 시 startedAt을 해당 월의 마지막 날로 변경
    if (name === "bymonthday" && value === "-1") {
      if (currentStart && dayjs(currentStart).isValid()) {
        const newStart = getLastDayOfMonth(currentStart);
        planDispatch({
          type: "UPDATE_PLAN_FIELD",
          payload: {name: "startedAt", value: newStart},
        });
        repeatRuleDispatch({
          type: "UPDATE_REPEAT_RULE_FIELD",
          payload: {name: "bymonthday", value: "-1"},
        });
        return;
      }
    }

    // bymonthday 필드 일반 처리 (SelectBox 사용)
    if (name === "bymonthday") {
      repeatRuleDispatch({
        type: "UPDATE_REPEAT_RULE_FIELD",
        payload: {name: "bymonthday", value: value},
      });
      return;
    }

    // 나머지 일반 필드 처리
    if (name !== "freq" && name !== "bymonthday") {
      // Input 컴포넌트를 사용하는 필드들은 value를 사용
      const inputFields = ["repeatEndType", "count", "interval", "until"];
      const fieldValue = inputFields.includes(name) ? value : checkValue;
      repeatRuleDispatch({
        type: "UPDATE_REPEAT_RULE_FIELD",
        payload: {
          name: name as keyof RepeatRuleType,
          value: fieldValue,
        },
      });
    }
  }

  async function onSubmitPlan() {
    if (!validationCheck()) return;
    const planType = plan?.planType;

    const payload = {
      plan: plan,
      repeatRule: repeatRuleState.repeatRule,
      schedule: planType === PlanTypes.SCHEDULE ? scheduleState.schedule : null,
      task: planType === PlanTypes.TASK ? taskState.task : null,
      dayoff: planType === PlanTypes.DAYOFF ? dayoffState.dayoff : null,
      // booking: planType === PlanTypes.BOOKING ? plan.bookingPlan : null,
    };
    if (!payload) {
      console.warn("Unknown or missing plan data");
      return;
    }

    const res = await requestPost("/plan/createOrUpdatePlan", payload);
    if (res.statusCode === 200) {
      onCloseModal();
      AlertService.success("일정 등록이 완료되었습니다.");
      planDispatch({
        type: "SET_SELECTED",
        payload: res.data.plan.planIdx,
      });
      
      // 서버 응답 데이터를 클라이언트 형식에 맞게 변환
      const newPlan = {
        ...res.data.plan,
        menuIdx: String(res.data.plan.menuIdx),
        planMenu: {
          ...res.data.plan.calendar,
          menuIdx: String(res.data.plan.calendar.menuIdx),
          menuId: res.data.plan.calendar.menuId,
          menuColor: res.data.plan.calendar.menuColor,
        },
      };
      
      setPlans((prev: PlanType[]) => [...prev, newPlan]);
    } else {
      AlertService.error("일정 등록에 실패하였습니다.");
    }
  }

  // "월 반복" 선택 시 날짜 옵션 구성
  const whichDayinTheMonth = [
    {
      label:
        plan.startedAt?.split("T")[0] === "Invalid Date"
          ? "시작일 선택"
          : `${getDateNumber(toKSTDateString(plan?.startedAt ?? ""))}일`,
      value: getDateNumber(toKSTDateString(plan?.startedAt ?? "")),
    },
    {
      label: "말일",
      value: "-1",
    },
  ];

  // 상태 초기화 및 모달 close
  function onCloseModal() {
    planDispatch({type: "SET_MODE", payload: "view"});
    addNewPlanModal.closeModal();
  }

  return (
    <>
      <Modal
        modalConfig={addNewPlanModal.modalConfig}
        closeModal={onCloseModal}
        modalTitle={mode === "edit" ? "일정 수정" : "일정 생성"}
        width={"40vw"}
        height={"50vh"}
        footerContent={
          <CommonButtonGroup
            usedButtons={{btnSubmit: true}}
            onSubmit={onSubmitPlan}
          />
        }
      >
        <PlanAddModalHeader />
        {plan?.planType === PlanTypes.SCHEDULE && (
          <AddNewSchedule
            calendarGroup={calendarGroup}
            onChangeNewPlan={onChangeNewPlan}
            onChangeRepeatRule={onChangeRepeatRule}
            whichDayinTheMonth={whichDayinTheMonth}
          />
        )}
        {plan?.planType === PlanTypes.TASK && (
          <AddNewTask
            calendarGroup={calendarGroup}
            onChangeNewPlan={onChangeNewPlan}
            onChangeRepeatRule={onChangeRepeatRule}
            whichDayinTheMonth={whichDayinTheMonth}
          />
        )}
        {plan?.planType === PlanTypes.DAYOFF && (
          <AddNewDayOff onChangeNewPlan={onChangeNewPlan} />
        )}
        {plan?.planType === PlanTypes.BOOKING && (
          <AddNewBooking onChangeNewPlan={onChangeNewPlan} />
        )}
      </Modal>
    </>
  );
}
