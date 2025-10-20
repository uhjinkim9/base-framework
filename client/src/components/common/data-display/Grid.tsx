"use client";
import styles from "./styles/Grid.module.scss";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

import { GridProps, MetaProps } from "../form-properties/types/grid-props.type";

// row.id로 editingCell 추적하고,
// rowIndex로 setRows([...]) 업데이트할 때 쓰는 구조가 정석이라고 함

export default function Grid<T>({
  data,
  columns,
  onUpdate,
  onRowClick,
}: GridProps<T>) {
  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const [editingCell, setEditingCell] = useState<{
    rowId: string;
    colId: string;
  } | null>(null);

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  // key={header.id}
                  key={header.id}
                  style={{
                    width: header.getSize(),
                    minWidth: header.column.columnDef.minSize,
                    maxWidth: header.column.columnDef.maxSize,
                  }}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows?.length > 0 &&
            table.getRowModel().rows.map((row, rowIndex) => (
              <tr
                key={row.id}
                onClick={() => {
                  if (onRowClick) {
                    onRowClick(row.original); // 행 클릭 이벤트 호출
                  }
                }}
                className={`${styles.row} ${
                  onRowClick ? styles.hoverableRow : ""
                }`} // hover 스타일 추가
              >
                {row.getVisibleCells().map((cell) => {
                  const isEditable =
                    (cell.column.columnDef.meta as MetaProps)?.editable ===
                    true;

                  const isEditing =
                    editingCell?.rowId === row.id &&
                    editingCell?.colId === cell.column.id;

                  return (
                    <td
                      key={cell.id}
                      // onDoubleClick={() => {
                      onClick={() => {
                        if (isEditable) {
                          setEditingCell({
                            rowId: row.id,
                            colId: cell.column.id,
                          });
                        }
                      }}>
                      <div
                        className={
                          isEditable ? styles.editableCell : undefined
                        }>
                        {isEditing ? (
                          // {true ? (
                          <input
                            autoFocus
                            defaultValue={cell.getValue() as string}
                            onBlur={(e) => {
                              const newValue = e.target.value;
                              setEditingCell(null);
                              if (onUpdate) {
                                onUpdate({
                                  idx: rowIndex,
                                  name: cell.column.id,
                                  value: newValue,
                                });
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                (e.target as HTMLInputElement).blur();
                              }
                            }}
                            className={styles.cellInput}
                          />
                        ) : (
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
