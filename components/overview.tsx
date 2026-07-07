"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

type OverviewData = {
  name: string;
  total: number;
};

interface OverviewProps {
  data: OverviewData[];
}

export function Overview({ data }: OverviewProps) {
  if (!data || data.length === 0) {
    return <div className="flex h-[350px] items-center justify-center text-muted-foreground">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={350} className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-75 fill-mode-both">
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888888" opacity={0.2} />
        <XAxis 
          dataKey="name" 
          stroke="#888888" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip 
          cursor={{ fill: 'rgba(120,120,120,0.1)' }}
          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
          labelStyle={{ color: '#0f172a', fontWeight: 'bold', marginBottom: '4px' }}
        />
        <Bar dataKey="total" fill="url(#colorTotal)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
