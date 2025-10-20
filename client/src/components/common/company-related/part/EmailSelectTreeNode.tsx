"use client";
import styles from "../styles/OrgTreeSelect.module.scss";
import {FaChevronDown, FaChevronRight, FaStar, FaFolder} from "react-icons/fa6";
import {motion, AnimatePresence} from "framer-motion";
import {OrgTreeType} from "../types/organization.type";
import ButtonBasic from "../../form-properties/ButtonBasic";

type Props = {
	node: OrgTreeType;
	level: number;
	expanded: Record<string, boolean>;
	toggle: (deptCd: string) => void;
	selectedTargets: string[];
	onSelect: (payload: any) => void;
};

export default function EmpEmailSelectTreeNode({
	node,
	level,
	expanded,
	toggle,
	selectedTargets,
	onSelect,
}: Props) {
	return (
		<div key={node.deptCd} style={{marginLeft: 30}}>
			<div className={styles.nodeRow}>
				<div
					className={styles.dept}
					onClick={() => toggle(node.deptCd || "")}
				>
					{node.children?.length ? (
						expanded[node.deptCd || ""] ? (
							<FaChevronDown />
						) : (
							<FaChevronRight />
						)
					) : (
						<FaFolder className={styles.folderIcon} />
					)}
					{node.deptNm}
				</div>

				<ButtonBasic
					onClick={() =>
						onSelect({
							deptCd: node.deptCd,
							deptNm: node.deptNm,
						})
					}
					onHoverOpaque
					width="2.8rem"
				>
					선택
				</ButtonBasic>
			</div>

			<AnimatePresence initial={false}>
				{expanded[node.deptCd || ""] && (
					<motion.div
						initial={{opacity: 0, height: 0}}
						animate={{opacity: 1, height: "auto"}}
						exit={{opacity: 0, height: 0}}
						transition={{duration: 0.3}}
					>
						{node.emps?.map((emp) => {
							const isSelected = selectedTargets.some(
								(t) => t === emp.email
							);

							return (
								<div
									key={emp.userId}
									className={styles.emps}
									style={{
										color: isSelected ? "#FF6900" : "black",
									}}
									onClick={() =>
										onSelect({
											userId: emp.userId,
											korNm: emp.korNm,
											posNm: emp.posNm,
											deptCd: emp.deptCd,
											deptNm: emp.deptNm,
											jobGroup: emp.jobGroup,
											jobGroupNm: emp.jobGroupNm,
											email: emp.email,
										})
									}
								>
									<span className={styles.emp}>
										{node.mngEmpNo === emp.userId && (
											<FaStar
												className={styles.starIcon}
											/>
										)}
										{emp.posNm
											? ` ${emp.korNm} ${emp.posNm}`
											: ` ${emp.korNm}`}
									</span>
								</div>
							);
						})}

						{node.children?.map((child) => (
							<EmpEmailSelectTreeNode
								key={child.deptCd}
								node={child}
								level={level + 1}
								expanded={expanded}
								toggle={toggle}
								selectedTargets={selectedTargets}
								onSelect={onSelect}
							/>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
