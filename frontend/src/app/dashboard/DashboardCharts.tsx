'use client';
import React from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { MonthlyChartItem } from '@/services/system/dashboard.service';

interface Props {
  data?: MonthlyChartItem[];
  isLoading?: boolean;
}

const fmtMillion = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : String(v);

export function DashboardCharts({ data, isLoading }: Props) {
  const chartData = (data || []).map(d => ({
    name: d.month,
    'Nhập kho': d.stockIn,
    'Xuất kho': d.stockOut,
  }));

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      border: 'none',
      fontSize: '12px'
    }
  };

  if (isLoading) {
    return (
      <div className="chart-container bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-full flex items-center justify-center min-h-[350px]">
        <div className="text-gray-400 dark:text-gray-500 text-sm animate-pulse">Đang tải dữ liệu biểu đồ...</div>
      </div>
    );
  }

  return (
    <div className="chart-container bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-full">
      <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-gray-800 dark:text-white">
        Tổng quan Nhập / Xuất Kho (7 tháng gần nhất)
      </h2>
      <div className="h-60 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 12 }} tickMargin={10} />
            <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} tickMargin={8} tickFormatter={fmtMillion} />
            <Tooltip {...tooltipStyle} formatter={(v: any) => fmtMillion(Number(v) || 0)} />
            <Legend wrapperStyle={{ paddingTop: 10, fontSize: '12px' }} />
            <Line type="monotone" dataKey="Nhập kho" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }} />
            <Line type="monotone" dataKey="Xuất kho" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }}
              activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 sm:mt-8">
        <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-gray-800 dark:text-white">
          So sánh Nhập vs Xuất theo tháng
        </h2>
        <div className="h-48 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 12 }} tickMargin={10} />
              <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} tickMargin={8} tickFormatter={fmtMillion} />
              <Tooltip {...tooltipStyle} formatter={(v: any) => fmtMillion(Number(v) || 0)} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="Nhập kho" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Xuất kho" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}