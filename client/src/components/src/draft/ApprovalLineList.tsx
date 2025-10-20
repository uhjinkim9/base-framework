import { ApprovalLine } from "@/types/draft";
import { FaGripLines } from "react-icons/fa";
import style from "./styles/ApprovalLineList.module.scss";

interface ApprovalLineListProps {
  approvalLines: ApprovalLine[];
  onReorder: (newOrder: ApprovalLine[]) => void;
}

export default function ApprovalLineList({
  approvalLines,
  onReorder,
}: ApprovalLineListProps) {
  return (
    <div className={style.approvalLineContainer}>
      {approvalLines.map((line, index) => (
        <div key={line.id} className={style.approvalLine}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}>
            <div className={style.approvalBadge}>
              <span style={{ width: "2.1rem" }}>{line.gubun}</span>
            </div>
            <div className={style.mainText}>
              {line.name}/{line.position}/{line.department}
            </div>
          </div>
          <div>
            <FaGripLines size={18} style={{ cursor: "pointer" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
