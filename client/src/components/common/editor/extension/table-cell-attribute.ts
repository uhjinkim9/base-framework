import TableCell from "@tiptap/extension-table-cell";
import type { Command } from "@tiptap/core";

// TipTap Commands 타입 보강: 체이닝에서 setRowHeight/unsetRowHeight 사용 가능하도록 선언
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    tableCellAttr: {
      setRowHeight: (heightPx: number) => ReturnType
      unsetRowHeight: () => ReturnType
    }
  }
}

const TableCellAttr = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        renderHTML: (attributes) => {
          const bg = attributes.backgroundColor as string | null;
          const rh = attributes.rowHeight as string | null;
          if (!bg && !rh) return {};
          const height = rh ? (String(rh).endsWith("px") ? String(rh) : `${rh}px`) : null;
          const parts: string[] = [];
          if (bg) parts.push(`background-color: ${bg};`);
          if (height) parts.push(`height: ${height};`);
          return parts.length ? { style: parts.join(" ") } : {};
        },
        parseHTML: (element) => {
          const backgroundColor = (element as HTMLElement).style.backgroundColor;
          return backgroundColor ? backgroundColor.replace(/["\']/g, "") : null;
        },
      },
      // 행(셀) 높이 조정을 위한 속성
      rowHeight: {
        default: null,
        parseHTML: (element) => {
          const el = element as HTMLElement;
          const data = el.getAttribute("data-row-height");
          const styleHeight = el.style?.height || null;
          return data ?? styleHeight ?? null;
        },
        renderHTML: (attributes) => {
          const value = attributes.rowHeight as string | null;
          const v = value ? String(value) : null;
          const height = v ? (v.endsWith("px") ? v : `${v}px`) : null;
          const bg = attributes.backgroundColor as string | null;
          const parts: string[] = [];
          if (bg) parts.push(`background-color: ${bg};`);
          if (height) parts.push(`height: ${height};`);
          if (parts.length) {
            return {
              "data-row-height": value ?? null,
              style: parts.join(" "),
            };
          }
          return { "data-row-height": value ?? null };
        },
      },
    };
  },

  addCommands() {
    return {
      setRowHeight:
        (heightPx: number): Command => ({ chain }) => {
          const value = `${Math.max(12, Math.round(heightPx))}px`;
          return chain().setCellAttribute("rowHeight", value).run();
        },
      unsetRowHeight:
        (): Command => ({ chain }) => chain().setCellAttribute("rowHeight", null).run(),
    } as any;
  },
});

export default TableCellAttr;
