"use client";
import styles from "../styles/PlanModal.module.scss";

import {usePlanContext} from "@/context/PlanContext";
import {PlanType, PlanTypes} from "@/types/plan.type";
import {FakeChangeEventType} from "@/types/common.type";

import Radio from "@/components/common/form-properties/Radio";
import Divider from "@/components/common/segment/Divider";

export default function PlanAddModalHeader() {
	const {planState, planDispatch} = usePlanContext();
	const {plan} = planState;
	const planType = plan.planType;

	function onChangeNewPlan(e: FakeChangeEventType) {
		const {name, checkValue} = e.target;
		if (checkValue) {
			planDispatch({
				type: "UPDATE_PLAN_FIELD",
				payload: {
					name: name as keyof PlanType,
					value: checkValue,
				},
			});
		}
	}

	return (
		<>
			<div className={styles.radioGroup}>
				<Radio
					name="planType"
					checkValue={PlanTypes.SCHEDULE}
					value={planType === PlanTypes.SCHEDULE}
					onChange={onChangeNewPlan}
				>
					일정
				</Radio>
				<Radio
					name="planType"
					checkValue={PlanTypes.TASK}
					value={planType === PlanTypes.TASK}
					onChange={onChangeNewPlan}
				>
					업무
				</Radio>
				<Radio
					name="planType"
					checkValue={PlanTypes.DAYOFF}
					value={planType === PlanTypes.DAYOFF}
					onChange={onChangeNewPlan}
				>
					휴가
				</Radio>
				<Radio
					name="planType"
					checkValue={PlanTypes.BOOKING}
					value={planType === PlanTypes.BOOKING}
					onChange={onChangeNewPlan}
				>
					자원 예약
				</Radio>
			</div>
			<Divider></Divider>
		</>
	);
}
