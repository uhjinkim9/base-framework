"use client";
import React from "react";
import {PieChart, Pie, Cell, Tooltip, ResponsiveContainer} from "recharts";

type DataProps = {id: string; name: string; value: number};

interface PieChartProps {
  data: DataProps[];
  colors?: string[];
  width?: number | string;
  height?: number | string;
  type?: "filled" | "donut";
  showTooltip?: boolean;
  children?: React.ReactNode; // 중앙에 표시할 내용
}

export default function PieChartComponent({
  data,
  colors = ["#e5e5e5", "#4D96FF"], // 기본값: 회색/파란색
  width = 300,
  height = 300,
  type = "donut",
  showTooltip = true,
  children,
}: PieChartProps) {
  const isDonut = type === "donut";

  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={isDonut ? 85 : 0}
            startAngle={90} // 12시 방향에서 시작
            endAngle={-270} // 시계 방향으로 그리기
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
          {showTooltip && <Tooltip />}
        </PieChart>
      </ResponsiveContainer>

      {/* 중앙 텍스트 (absolute overlay) */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          lineHeight: 1.4,
        }}
      >
        {children}
      </div>
    </div>
  );
}
