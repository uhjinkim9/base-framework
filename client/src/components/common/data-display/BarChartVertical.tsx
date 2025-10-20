"use client";
import styles from ".//styles/BarChartVertical.module.scss";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import React from "react";

type DataProps = {id: string; name?: string; value: number; label?: string};

interface BarChartProps {
  data: DataProps[];
  maxValue?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLabel?: boolean; // 라벨 표시 여부
  labelColor?: string; // 라벨 색상
  labelFontSize?: number; // 라벨 폰트 크기
  barColor?: string;
  overtimeColor?: string;
  backgroundColor?: string;
  barSize?: number;
  radius?: [number, number, number, number];
  width?: string;
  height?: string;
  axisLine?: boolean;
  tickLine?: boolean;
}

export default function BarChartVertical({
  data,
  maxValue = 40,
  showGrid = true,
  showTooltip = false,
  showLabel = true,
  labelColor = "#444",
  labelFontSize = 13,
  barColor = "#4D96FF",
  overtimeColor = "#FF3B30",
  backgroundColor = "#eeeeee",
  barSize = 15,
  radius = [0, 25, 25, 0],
  width = "45rem",
  height = "20rem",
  axisLine = true,
  tickLine = true,
}: BarChartProps) {
  const chartData = data.map((item) => {
    const overtime = Math.max(0, item.value - maxValue);
    const base = Math.min(item.value, maxValue);
    // const remaining = Math.max(0, maxValue - item.value);
    const background = Math.max(0, maxValue);
    return {
      ...item,
      overtime,
      base,
      background,
      displayLabel: item.label || item.value,
    };
  });

  // name이 있는 항목이 하나라도 있는지 확인
  const hasNames = data.some(
    (item) => item.name !== undefined && item.name !== "",
  );

  // YAxis width 계산: showLabel이 false거나 name이 없으면 0, 그렇지 않으면 20
  const yAxisWidth = showLabel && hasNames ? 20 : 0;

  return (
    <div style={{width, height}} className={styles.chartWrapper}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          barCategoryGap={0}
          margin={{top: 0, right: 65, left: 20, bottom: 0}}
          barGap={-barSize - 0.2}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis
            type="number"
            domain={[0, maxValue]}
            axisLine={axisLine}
            tickLine={tickLine}
            tick={tickLine}
          />
          <YAxis
            dataKey="name"
            type="category"
            width={yAxisWidth}
            tick={{
              fontSize: labelFontSize,
              fill: labelColor,
              fontWeight: 500,
            }}
            axisLine={axisLine}
            tickLine={tickLine}
            padding={{top: 20, bottom: 20}}
            yAxisId="overlay"
          />
          {showTooltip && <Tooltip cursor={false} />}

          {/* 미달 구간 바 (#eeeeee) */}
          <Bar
            dataKey="background"
            stackId="a"
            barSize={barSize}
            fill={backgroundColor}
            radius={radius}
            isAnimationActive={true}
            activeBar={false}
            yAxisId="overlay"
          >
            {/* 값 라벨 */}
            <LabelList
              dataKey="displayLabel"
              position="right"
              content={({x, y, value, width, height}) => {
                const xNum = Number(x ?? 0);
                const yNum = Number(y ?? 0);
                const wNum = Number(width ?? 0);
                const hNum = Number(height ?? 0);
                return (
                  <text
                    x={xNum + wNum + 8}
                    y={yNum + hNum / 2} // 세로 가운데 정렬
                    fill="#333"
                    fontSize={12}
                    textAnchor="start"
                    dominantBaseline="middle" // 텍스트 세로 중앙 정렬
                  >
                    {value}
                  </text>
                );
              }}
            />
          </Bar>

          {/* 파란색 (기준 40h 구간) */}
          <Bar
            dataKey="base"
            // stackId="a"
            barSize={barSize}
            fill={barColor}
            radius={radius}
            isAnimationActive={true}
            activeBar={false}
            yAxisId="overlay"
          ></Bar>

          {/* 빨간색 (초과 구간) — 40까지만 파랑, 왼쪽에 붙음 */}
          <Bar
            dataKey="overtime"
            barSize={barSize + 0.4}
            fill={overtimeColor}
            radius={radius}
            stackId="overtime"
            isAnimationActive={true}
            yAxisId="overlay"
          ></Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
