"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AgentCost {
  name: string;
  cost: number;
  count: number;
}

interface CostBreakdownProps {
  data: AgentCost[];
}

export default function CostBreakdown({ data }: CostBreakdownProps) {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-500 text-sm">No cost data available</div>;
  }

  const formatted = data.map((d) => ({ ...d, cost: parseFloat(d.cost.toFixed(4)) }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={formatted} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
        <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} tickLine={false} axisLine={false}
          tickFormatter={(v) => `$${v}`} />
        <Tooltip
          contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "0.75rem" }}
          formatter={(v: number) => [`$${v.toFixed(4)}`, "Cost"]}
        />
        <Bar dataKey="cost" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Cost (USD)" />
      </BarChart>
    </ResponsiveContainer>
  );
}