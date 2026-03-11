"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { DashboardKpiCards } from './dashboard/DashboardKpiCards';
import { PageHeader } from '@/components/common/PageHeader';
import { DashboardService, DashboardSummary } from '@/services/system/dashboard.service';

const DashboardCharts = dynamic(() => import('./dashboard/DashboardCharts').then(mod => mod.DashboardCharts), {
  ssr: false,
  loading: () => <div className="h-96 w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
});

const RecentActivity = dynamic(() => import('./dashboard/RecentActivity').then(mod => mod.RecentActivity), {
  ssr: false,
  loading: () => <div className="h-96 w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
});

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    DashboardService.getSummary()
      .then(data => setSummary(data))
      .catch(err => console.error('Failed to load dashboard data', err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="w-full mx-auto">
      <PageHeader 
        title="Dashboard" 
        description="Welcome back to Pocket ERP Mini"
      />
      <DashboardKpiCards kpi={summary?.kpi} isLoading={isLoading} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <DashboardCharts data={summary?.monthlyChart} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-1">
          <RecentActivity activities={summary?.recentActivity} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
