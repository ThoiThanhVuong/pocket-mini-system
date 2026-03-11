'use client';
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, ArrowRightLeft, Loader2 } from 'lucide-react';
import { RecentActivityItem } from '@/services/system/dashboard.service';

interface Props {
  activities?: RecentActivityItem[];
  isLoading?: boolean;
}

const statusColors: Record<string, string> = {
  PENDING:   'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  APPROVED:  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const typeIcon = (type: string) => {
  if (type === 'stock_in') return <Package size={16} className="text-blue-600" />;
  if (type === 'stock_out') return <ShoppingCart size={16} className="text-emerald-600" />;
  return <ArrowRightLeft size={16} className="text-amber-600" />;
};
const typeIconBg = (type: string) => {
  if (type === 'stock_in') return 'bg-blue-100 dark:bg-blue-900/30';
  if (type === 'stock_out') return 'bg-emerald-100 dark:bg-emerald-900/30';
  return 'bg-amber-100 dark:bg-amber-900/30';
};
const typeLabel = (type: string) => {
  if (type === 'stock_in') return 'Phiếu nhập';
  if (type === 'stock_out') return 'Phiếu xuất';
  return 'Chuyển kho';
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  return `${Math.floor(hrs / 24)} ngày trước`;
}

const ActivityRow = memo(({ item }: { item: RecentActivityItem }) => (
  <div className="flex items-start mb-4 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0 last:mb-0">
    <div className={`${typeIconBg(item.type)} p-2 rounded-full mr-3 flex-shrink-0`}>
      {typeIcon(item.type)}
    </div>
    <div className="flex-grow min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <p className="font-medium text-sm text-gray-800 dark:text-white truncate">{typeLabel(item.type)}: {item.code}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[item.status] || 'bg-gray-100 text-gray-600'}`}>
          {item.status}
        </span>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{item.description}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{timeAgo(item.createdAt)}</p>
    </div>
  </div>
));
ActivityRow.displayName = 'ActivityRow';

export function RecentActivity({ activities, isLoading }: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-full">
      <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-gray-800 dark:text-white">
        Hoạt động gần đây
      </h2>
      <div className="overflow-y-auto max-h-[500px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        ) : !activities || activities.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">Chưa có hoạt động nào</p>
        ) : (
          activities.map((item, i) => <ActivityRow key={i} item={item} />)
        )}
      </div>
      <motion.button
        className="w-full mt-4 text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        Xem tất cả hoạt động
      </motion.button>
    </div>
  );
}