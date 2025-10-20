"use client";
import styles from "../styles/PlanModal.module.scss";

import InputBasic from "@/components/common/form-properties/InputBasic";
import {usePlanContext} from "@/context/PlanContext";
import {VscCalendar} from "react-icons/vsc";

export default function AddNewBooking({
	onChangeNewPlan,
}: {
	onChangeNewPlan: (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => void;
}) {
	const {
		planState,
		//  bookingDispatch
	} = usePlanContext();
	const {plan} = planState;

	function onChangeBooking(
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) {
		const {name, value} = e.target;
	}

	return (
		<div className={styles.wrapper}>
			<div className={styles.row}>
				<InputBasic
					label="제목"
					onChange={onChangeNewPlan}
					value={plan?.title}
					name="title"
				/>
			</div>

			<div className={styles.row}>
				<VscCalendar />
				<span className={styles.refText}>TODO: 전자결재 후</span>
			</div>
		</div>
	);
}
