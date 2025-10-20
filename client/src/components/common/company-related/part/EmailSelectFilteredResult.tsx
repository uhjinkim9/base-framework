"use client";
import Divider from "../../segment/Divider";
import styles from "../styles/OrgTreeSelect.module.scss";

type FilteredResultProps = {
	grouped: Map<string, any[]>;
	onSelect: (payload: any) => void;
};

export default function EmailSelectFilteredResult({
	grouped,
	onSelect,
}: FilteredResultProps) {
	return (
		<div className={styles.filteredEmpList}>
			{Array.from(grouped.entries()).map(([deptCd, emps]) => {
				const deptNm = emps[0]?.deptNm || "부서 없음";
				return (
					<div key={deptCd} className={styles.filteredGroup}>
						<Divider type="middle" />

						<div
							className={styles.dept}
							onClick={() =>
								onSelect({
									deptCd,
									deptNm,
								})
							}
						>
							<strong>{deptNm}</strong>
						</div>
						{emps.map((emp) => (
							<p
								key={emp.userId}
								className={styles.emp}
								onClick={() =>
									onSelect({
										userId: emp.userId,
										korNm: emp.korNm,
										posNm: emp.posNm,
										deptCd: emp.deptCd,
										deptNm: emp.deptNm,
										jobGroup: emp.jobGroup,
										jobGroupNm: emp.jobGroupNm,
									})
								}
							>
								{emp.korNm} {emp.posNm} / {emp.jobGroupNm} /{" "}
								{emp.deptNm}
							</p>
						))}
					</div>
				);
			})}
		</div>
	);
}
