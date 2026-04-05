'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DataPoint {
  date: string;
  avgLatency: number;
}

interface Props {
  data: DataPoint[];
}

export default function LatencyChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}ms`} />
        <Tooltip formatter={(value: number) => [`${value}ms`, 'Avg Latency']} />
        <Line type="monotone" dataKey="avgLatency" stroke="#8b5cf6" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}