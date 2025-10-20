"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";

type DataProps = {id: string; name: string; value: number};

export default function BarChartHorizontal({data: data}: {data: DataProps[]}) {
  // 가장 큰 값 찾아서 색깔 설정
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div style={{width: "70%"}}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{top: 20, right: 20, bottom: 0, left: 20}}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />

          <Bar dataKey="value" barSize={20} radius={[25, 25, 0, 0]}>
            <LabelList dataKey="value" position="top" />

            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.value === maxValue ? "#FF6A00" : "#030720"} // 주황 or 남색
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
