import { AttachmentFile } from "@/types/draft";
import { GrAttachment } from "react-icons/gr";
import { IoMdClose } from "react-icons/io";

interface AttachmentListProps {
  attachments: AttachmentFile[];
  onRemove: (id: string) => void;
}

export default function AttachmentList({
  attachments,
  onRemove,
}: AttachmentListProps) {
  return (
    <div>
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "baseline",
          }}>
          <GrAttachment />
          <span>
            {attachment.name} ({attachment.size})
          </span>
          <IoMdClose
            style={{ cursor: "pointer", verticalAlign: "bottom" }}
            onClick={() => onRemove(attachment.id)}
          />
        </div>
      ))}
    </div>
  );
}
