'use client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DataPoint {
  date: string;
  cost: number;
}

interface Props {
  data: DataPoint[];
}

export default function CostChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
        <Tooltip formatter={(value: number) => [`$${value.toFixed(4)}`, 'Cost']} />
        <Area type="monotone" dataKey="cost" stroke="#2563eb" fill="#dbeafe" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}