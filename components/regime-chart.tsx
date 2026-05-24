"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { macroGroups } from "@/lib/mock-data";

export function RegimeChart() {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: 720, height: 288 }}
      >
        <BarChart data={macroGroups} margin={{ left: -18, right: 8, top: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval={0}
            height={72}
          />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ fill: "rgba(215, 25, 32, 0.08)" }}
            contentStyle={{ borderRadius: 8, borderColor: "#e5e7eb" }}
          />
          <Bar dataKey="score" fill="#d71920" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
