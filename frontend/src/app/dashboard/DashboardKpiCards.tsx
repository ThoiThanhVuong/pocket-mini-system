'use client';
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Package,
  CreditCard,
  ShoppingCart,
  Users,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { DashboardKpi } from '@/services/system/dashboard.service';

interface Props {
  kpi?: DashboardKpi;
  isLoading?: boolean;
}

const fmt = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `${(n / 1_000).toFixed(1)}K`
    : String(n);

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

export function DashboardKpiCards({ kpi, isLoading }: Props) {
  const cards = [
    {
      title: 'Doanh thu (đã thanh toán)',
      value: isLoading ? '...' : fmtCurrency(kpi?.totalRevenue ?? 0),
      icon: <CreditCard className="text-blue-600" size={24} />,
      color: 'bg-blue-100 dark:bg-blue-900/30',
      badge: null,
    },
    {
      title: 'Tổng sản phẩm',
      value: isLoading ? '...' : fmt(kpi?.totalProducts ?? 0),
      icon: <Package className="text-indigo-600" size={24} />,
      color: 'bg-indigo-100 dark:bg-indigo-900/30',
      badge: null,
    },
    {
      title: 'Phiếu nhập kho',
      value: isLoading ? '...' : fmt(kpi?.totalStockIns ?? 0),
      icon: <ShoppingCart className="text-amber-600" size={24} />,
      color: 'bg-amber-100 dark:bg-amber-900/30',
      badge: kpi?.pendingStockOuts ? { label: `${kpi.pendingStockOuts} đang chờ`, color: 'text-amber-600' } : null,
    },
    {
      title: 'Khách hàng',
      value: isLoading ? '...' : fmt(kpi?.totalCustomers ?? 0),
      icon: <Users className="text-emerald-600" size={24} />,
      color: 'bg-emerald-100 dark:bg-emerald-900/30',
      badge: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          className="kpi-card bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
          whileHover={{ y: -5, boxShadow: '0 10px 30px -15px rgba(0,0,0,0.2)' }}
        >
          <div className="flex justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{card.title}</p>
              <h3 className="text-lg sm:text-2xl font-bold mt-1 text-gray-800 dark:text-white truncate">
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin text-gray-400" />
                ) : card.value}
              </h3>
              {card.badge && (
                <div className="flex items-center mt-2 gap-1">
                  <AlertTriangle size={12} className={card.badge.color} />
                  <span className={`text-xs ${card.badge.color}`}>{card.badge.label}</span>
                </div>
              )}
              {!card.badge && (
                <div className="flex items-center mt-2">
                  <TrendingUp size={14} className="text-green-500 mr-1" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Tổng tích lũy</span>
                </div>
              )}
            </div>
            <div className={`${card.color} p-3 rounded-full h-fit flex-shrink-0 ml-2`}>{card.icon}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}