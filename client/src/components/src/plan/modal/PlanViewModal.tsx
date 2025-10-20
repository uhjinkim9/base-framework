"use client";
import styles from "../styles/PlanModal.module.scss";
import clsx from "clsx";

import Modal from "@/components/common/layout/Modal";
import {
  isBooking,
  isDayoff,
  isSchedule,
  isTask,
  PlanType,
  planTypeMap,
  PlanTypes,
} from "@/types/plan.type";
import {
  VscCalendar,
  VscListSelection,
  VscLocation,
  VscListUnordered,
  VscBrowser,
} from "react-icons/vsc";
import {GoClock, GoPeople} from "react-icons/go";

import {isNotEmpty} from "@/util/validators/check-empty";
import ColoredCircle from "@/components/common/segment/ColoredCircle";
import {useUserContext} from "@/context/UserContext";
import {usePlanContext} from "@/context/PlanContext";
import CommonButtonGroup from "@/components/common/segment/CommonButtonGroup";
import PlanAddModal from "./PlanAddModal";
import useModal from "@/hooks/useModal";
import {requestPost} from "@/util/api/api-service";
import {useEffect} from "react";
import {
  fullDateTimeWithLabel,
  fullDateWithLabel,
} from "@/util/helpers/formatters";
import {
  matchDayoffTypeNm,
  matchHalfoffNm,
} from "@/components/src/plan/etc/calendar-helper";
import {RepeatInfo} from "../RepeatNodes";
import CheckBox from "@/components/common/form-properties/CheckBox";
import AlertService from "@/services/alert.service";

type PlanCardProps = {
  showPlanModal: any;
};

// 후에 추가 모달과 통합 예정
export default function PlanViewModal({showPlanModal}: PlanCardProps) {
  const {
    planState,
    planDispatch,
    setPlans,
    scheduleState,
    scheduleDispatch,
    taskState,
    taskDispatch,
    dayoffDispatch,
    // bookingDispatch,
    repeatRuleDispatch,
  } = usePlanContext();
  const {plan, selected} = planState;
  const {schedule} = scheduleState;
  const {task} = taskState;

  // 플랜 타입별 dispatch 매핑
  const planTypeDispatchMap: Partial<
    Record<
      PlanTypes,
      {
        dispatch: (action: any) => void;
        action: string;
        dataKey: string;
      }
    >
  > = {
    [PlanTypes.SCHEDULE]: {
      dispatch: scheduleDispatch,
      action: "SET_SCHEDULE",
      dataKey: "schedule",
    },
    [PlanTypes.TASK]: {
      dispatch: taskDispatch,
      action: "SET_TASK",
      dataKey: "task",
    },
    [PlanTypes.DAYOFF]: {
      dispatch: dayoffDispatch,
      action: "SET_DAYOFF",
      dataKey: "dayoff",
    },
    // [PlanTypes.BOOKING]: {
    // 	dispatch: bookingDispatch,
    // 	action: "SET_BOOKING",
    // 	dataKey: "booking"
    // }
  };

  const addNewPlanModal = useModal();
  const {matchEmpNoToRank} = useUserContext();

  function onEdit() {
    // 현재 선택된 플랜을 편집 상태로 설정
    planDispatch({type: "SET_MODE", payload: "edit"});
    addNewPlanModal.openModal();
  }

  const getPlan = async () => {
    if (!selected) return;
    const res = await requestPost("/plan/getPlan", {
      planIdx: selected,
    });
    if (res.statusCode === 200) {
      const planInfo = {
        ...res.data,
        menuIdx: String(res.data.menuIdx),
        planMenu: {
          ...res.data.planMenu,
          menuIdx: String(res.data.planMenu?.menuIdx),
        },
      };
      planDispatch({type: "SET_PLAN", payload: planInfo});
      console.log(res.data);
      const planType = planInfo.planType as PlanTypes;

      // 제네릭 dispatch 처리
      const dispatchConfig = planTypeDispatchMap[planType];
      if (dispatchConfig) {
        const payload = planInfo[dispatchConfig.dataKey];
        dispatchConfig.dispatch({
          type: dispatchConfig.action,
          payload: payload,
        });

        repeatRuleDispatch({
          type: "SET_REPEAT_RULE",
          payload: planInfo.repeatRule,
        });
      }
    }
  };

  useEffect(() => {
    getPlan();
  }, [selected]);

  const onDeletePlan = async () => {
    if (!selected) return;
    const res = await requestPost("/plan/deletePlan", {
      planIdx: selected,
    });
    if (res.statusCode === 200) {
      AlertService.success("삭제되었습니다.");

      onCloseModal();
      setPlans((prev: PlanType[]) =>
        prev.filter((plan) => plan.planIdx !== selected),
      );
    } else {
      AlertService.error("실패하였습니다.");
    }
  };

  // 상태 초기화 및 모달 닫기
  function onCloseModal() {
    planDispatch({type: "RESET"});
    showPlanModal.closeModal();
  }

  return (
    <>
      <Modal
        modalConfig={showPlanModal.modalConfig}
        closeModal={onCloseModal}
        modalTitle={plan?.title}
        width={"35vw"}
        height={"40vh"}
        footerContent={
          plan?.planType !== PlanTypes.HOLIDAY && (
            <CommonButtonGroup
              usedButtons={
                planState.mode === "edit"
                  ? {btnSubmit: true}
                  : {btnEdit: true, btnDelete: true}
              }
              onEdit={onEdit}
              onDelete={onDeletePlan}
            />
          )
        }
      >
        <div className={styles.wrapper}>
          {/* 공통 */}
          <div className={styles.row}>
            <VscBrowser className={styles.icon} />
            {plan?.planType !== undefined &&
              planTypeMap[plan.planType as PlanTypes]}
          </div>

          <div className={styles.row}>
            <VscCalendar className={styles.icon} />
            <ColoredCircle colorCode={plan?.planMenu?.menuColor ?? "#000"} />
            {plan?.planMenu?.menuNm}
          </div>

          {/********** 플랜타입: 스케줄 */}
          {plan && isSchedule(plan) && (
            <>
              {plan?.startedAt && (
                <div className={styles.row}>
                  <GoClock className={styles.icon} />
                  {plan?.isAllday
                    ? // 종일 일정: 날짜만 표시
                      isNotEmpty(plan?.endedAt) &&
                      plan?.endedAt &&
                      plan?.startedAt < plan?.endedAt
                      ? `${fullDateWithLabel(
                          plan?.startedAt,
                        )} ~ ${fullDateWithLabel(plan?.endedAt)}`
                      : `${fullDateWithLabel(plan?.startedAt)}`
                    : // 시간 포함 일정: 시각까지 표시
                    isNotEmpty(plan?.endedAt) &&
                      plan?.endedAt &&
                      plan?.startedAt < plan?.endedAt
                    ? `${fullDateTimeWithLabel(
                        plan?.startedAt,
                      )} ~ ${fullDateTimeWithLabel(plan?.endedAt)}`
                    : `${fullDateTimeWithLabel(plan?.startedAt)}`}
                </div>
              )}

              <div className={clsx(styles.row, styles.indent)}>
                <CheckBox
                  name="isAllday"
                  value={plan?.isAllday}
                  readOnly={true}
                ></CheckBox>
                <span>종일</span>
              </div>
              <div className={clsx(styles.row, styles.indent)}>
                <CheckBox
                  name="isRepeated"
                  value={plan?.isRepeated}
                  readOnly={true}
                ></CheckBox>
                <span>반복</span>
              </div>
              <div className={styles.row}>
                <RepeatInfo />
              </div>

              {schedule?.location && (
                <div className={styles.row}>
                  <VscLocation className={styles.icon} />
                  {schedule?.location}
                </div>
              )}

              {schedule?.memo && (
                <div className={styles.row}>
                  <VscListSelection className={styles.icon} />
                  {schedule?.memo}
                </div>
              )}

              {schedule?.joinEmpNo && (
                <div className={styles.row}>
                  <GoPeople className={styles.icon} />
                  {matchEmpNoToRank(schedule?.joinEmpNo ?? "")}
                </div>
              )}

              {schedule?.joinThirdParty && (
                <div className={clsx(styles.row, styles.indent)}>
                  {schedule?.joinThirdParty
                    ? `외부 참석자: ${schedule?.joinThirdParty}`
                    : null}
                </div>
              )}
            </>
          )}

          {/********** 플랜타입: 태스크 */}
          {plan && isTask(plan) && (
            <>
              <div className={styles.row}>
                {plan?.startedAt && (
                  <>
                    <GoClock className={styles.icon} />
                    {plan?.isAllday
                      ? // 종일 일정: 날짜만 표시
                        `${fullDateWithLabel(plan?.startedAt)}`
                      : // 시간 포함 일정: 시각까지 표시
                        `${fullDateTimeWithLabel(plan?.startedAt)}`}
                  </>
                )}
              </div>
              <div className={clsx(styles.row, styles.indent)}>
                <CheckBox
                  name="isAllday"
                  value={plan?.isAllday}
                  readOnly={true}
                ></CheckBox>
                <span>종일</span>
              </div>

              {task?.memo && (
                <div className={styles.row}>
                  <VscListSelection className={styles.icon} />
                  {task?.memo}
                </div>
              )}
            </>
          )}

          {/********** 플랜타입: 휴가 */}
          {plan && isDayoff(plan) && (
            <>
              <div className={styles.row}>
                <span>
                  <VscListUnordered className={styles.icon} />
                  {`${matchDayoffTypeNm(plan?.dayoff?.offType ?? "")}`}
                  <span>
                    {isNotEmpty(plan?.dayoff?.halfOff)
                      ? ` - ${matchHalfoffNm(plan?.dayoff?.halfOff ?? "")}`
                      : ""}
                  </span>
                </span>
              </div>

              <div className={styles.row}>
                <span>
                  <VscListSelection className={styles.icon} />
                  {`${plan?.dayoff?.memo}`}
                </span>
              </div>
            </>
          )}

          {plan && isBooking(plan) && (
            <>
              <span>{`${plan?.usingPurpose}`}</span>
              <span>{`${plan?.resourceType}`}</span>
            </>
          )}
        </div>
      </Modal>
      {addNewPlanModal.modalConfig.isOpened && (
        <PlanAddModal addNewPlanModal={addNewPlanModal} />
      )}
    </>
  );
}
