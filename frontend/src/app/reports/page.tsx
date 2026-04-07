"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, TrendingUp, TrendingDown, Package, Users, ShoppingCart, Loader2, Download } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { PageHeader } from '@/components/common/PageHeader';
import {
  ReportService, ReportPeriod,
  SalesReport, InventoryReport, CustomersReport
} from '@/services/system/report.service';
import { toast } from 'sonner';


const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
const fmtNum = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : String(n);

const PIE_COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const tooltipStyle = {
  contentStyle: {
    backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none', fontSize: '12px',
  },
};

const TABS = [
  { id: 'sales',     label: 'Báo cáo Xuất kho' },
  { id: 'inventory', label: 'Báo cáo Tồn kho' },
  { id: 'customers', label: 'Báo cáo Khách hàng' },
];
const DATE_RANGES: { id: ReportPeriod; label: string }[] = [
  { id: 'week',    label: 'Tuần này' },
  { id: 'month',   label: 'Tháng này' },
  { id: 'quarter', label: 'Quý này' },
  { id: 'year',    label: 'Năm nay' },
];

// ─── KPI Card ─────────────────────────────────────────────────────────────
function KpiCard({ title, value, subtext, color = 'blue', icon }: {
  title: string; value: string; subtext?: string; color?: string; icon?: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{title}</h3>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtext && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{subtext}</p>}
        </div>
        {icon && <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/30`}>{icon}</div>}
      </div>
    </div>
  );
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2 size={36} className="animate-spin text-blue-500 mb-3" />
      <p className="text-gray-500 dark:text-gray-400 text-sm">Đang tải báo cáo...</p>
    </div>
  );
}

// ─── Sales Report ─────────────────────────────────────────────────────────
function SalesReportView({ data }: { data: SalesReport }) {
  const { kpi, trend, topProducts } = data;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <KpiCard title="Doanh thu xuất kho" value={fmtCurrency(kpi.totalRevenue)}
          subtext="Tổng giá trị đơn đã hoàn thành" icon={<TrendingUp className="text-blue-600" size={22} />} />
        <KpiCard title="Chi phí nhập kho" value={fmtCurrency(kpi.totalCost)}
          subtext="Tổng giá trị đơn nhập đã hoàn thành" color="emerald" icon={<ShoppingCart className="text-emerald-600" size={22} />} />
        <KpiCard title="Số phiếu xuất" value={String(kpi.totalOrders)}
          subtext="Không tính đơn đã hủy" color="amber" icon={<Package className="text-amber-600" size={22} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Xu hướng Nhập / Xuất kho</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} tickFormatter={fmtNum} />
                <Tooltip {...tooltipStyle} formatter={(v: number | undefined) => fmtCurrency(v ?? 0)} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="revenue" name="Xuất kho" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="cost" name="Nhập kho" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Top 5 sản phẩm xuất nhiều nhất</h3>
          {topProducts.length === 0 ? (
            <div className="flex items-center justify-center h-72 text-gray-400 text-sm">Chưa có dữ liệu</div>
          ) : (
            <div className="h-72 flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={topProducts} cx="50%" cy="50%" outerRadius={100} dataKey="quantity"
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}>
                    {topProducts.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number | undefined, _: string | undefined, props: any) => [`${v ?? 0}`, props?.payload?.name ?? '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Inventory Report ─────────────────────────────────────────────────────────
function InventoryReportView({ data }: { data: InventoryReport }) {
  const { kpi, byCategory } = data;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <KpiCard title="Tổng sản phẩm" value={String(kpi.totalProducts)} subtext="Sản phẩm đang hoạt động" />
        <KpiCard title="Sắp hết hàng" value={String(kpi.lowStockItems)} subtext="Cần theo dõi" color="amber"
          icon={<TrendingDown className="text-amber-600" size={22} />} />
        <KpiCard title="Hết hàng" value={String(kpi.outOfStockItems)} subtext="Cần nhập thêm" color="red"
          icon={<Package className="text-red-600" size={22} />} />
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Tình trạng tồn kho theo danh mục</h3>
        {byCategory.length === 0 ? (
          <div className="flex items-center justify-center h-72 text-gray-400 text-sm">Chưa có dữ liệu</div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="inStock"    name="Còn hàng"     fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lowStock"   name="Sắp hết"      fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outOfStock" name="Hết hàng"     fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Customers Report ─────────────────────────────────────────────────────
function CustomersReportView({ data }: { data: CustomersReport }) {
  const { kpi, byMonth } = data;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <KpiCard title="Tổng khách hàng" value={fmtNum(kpi.totalCustomers)} subtext="Toàn bộ hệ thống"
          icon={<Users className="text-blue-600" size={22} />} />
        <KpiCard title="Khách mới kỳ này" value={String(kpi.newThisPeriod)} subtext="Trong khoảng thời gian đã chọn" color="indigo"
          icon={<TrendingUp className="text-indigo-600" size={22} />} />
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Khách hàng mới theo tháng</h3>
        {byMonth.length === 0 ? (
          <div className="flex items-center justify-center h-72 text-gray-400 text-sm">Chưa có dữ liệu</div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byMonth} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="newCustomers" name="Khách hàng mới" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// â”€â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<string>('sales');
  const [period, setPeriod] = useState<ReportPeriod>('month');
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [salesData, setSalesData] = useState<SalesReport | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryReport | null>(null);
  const [customersData, setCustomersData] = useState<CustomersReport | null>(null);

  const fetchData = useCallback(async (tab: string, p: ReportPeriod) => {
    setIsLoading(true);
    try {
      if (tab === 'sales') {
        setSalesData(await ReportService.getSalesReport(p));
      } else if (tab === 'inventory') {
        setInventoryData(await ReportService.getInventoryReport());
      } else if (tab === 'customers') {
        setCustomersData(await ReportService.getCustomersReport(p));
      }
    } catch (err) {
      console.error('Failed to load report', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      let blob: Blob;
      let filename = `Bao-cao-${activeTab}-${period}.xlsx`;
      
      if (activeTab === 'sales') {
        blob = await ReportService.exportSalesReport(period);
      } else if (activeTab === 'inventory') {
        blob = await ReportService.exportInventoryReport();
        filename = 'Bao-cao-ton-kho.xlsx';
      } else {
        blob = await ReportService.exportCustomersReport(period);
      }
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Xuất file Excel thành công!');
    } catch (err) {
      console.error('Export failed', err);
      toast.error('Xuất file thất bại!');
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    fetchData(activeTab, period);
  }, [activeTab, period, fetchData]);

  const renderContent = () => {
    if (isLoading) return <LoadingSkeleton />;
    if (activeTab === 'sales' && salesData) return <SalesReportView data={salesData} />;
    if (activeTab === 'inventory' && inventoryData) return <InventoryReportView data={inventoryData} />;
    if (activeTab === 'customers' && customersData) return <CustomersReportView data={customersData} />;
    return null;
  };

  return (
    <div className="w-full mx-auto">
      <PageHeader title="Báo cáo" description="Phân tích hiệu quả hoạt động kinh doanh" />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Tab + filter bar */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 gap-3">
            <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
              {TABS.map(tab => (
                <motion.button
                  key={tab.id}
                  className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors
                    ${activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {tab.label}
                </motion.button>
              ))}
            </div>

            <div className="flex gap-1">
              {DATE_RANGES.map(r => (
                <motion.button
                  key={r.id}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                    ${period === r.id
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                  onClick={() => setPeriod(r.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {r.label}
                </motion.button>
              ))}

              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

              <motion.button
                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-medium rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors disabled:opacity-50"
                onClick={handleExport}
                disabled={isExporting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                title='Xuất Excel'
              >
                {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                <span className="hidden xs:inline">Xuất Excel</span>
              </motion.button>

              <motion.button
                className="p-1.5 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                onClick={() => fetchData(activeTab, period)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Làm mới"
              >
                <RefreshCcw size={16} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Report content */}
        <div className="p-4 sm:p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
