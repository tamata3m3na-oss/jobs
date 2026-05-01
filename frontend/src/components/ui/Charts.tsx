'use client';

import * as React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface BaseChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  yKey: string;
  color?: string;
}

export function LineChartComponent({ data, xKey, yKey, color = '#3b82f6' }: BaseChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          />
          <Line
            type="monotone"
            dataKey={yKey}
            stroke={color}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarChartComponent({ data, xKey, yKey, color = '#3b82f6' }: BaseChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          />
          <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface PieChartProps {
  data: { name: string; value: number }[];
}

interface PieLabelProps {
  name?: string;
  percent?: number;
}

export function PieChartComponent({ data }: PieChartProps) {
  const renderLabel = (props: PieLabelProps) => {
    const name = props.name ?? '';
    const percent = props.percent ?? 0;
    return `${name} ${(percent * 100).toFixed(0)}%`;
  };

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={renderLabel}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
