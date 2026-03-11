'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { IamService } from '@/services/iam/iam.service';
import { toast } from 'sonner';
import { User, UpdateProfileInput } from '@/types/iam/user';
import { User as UserIcon, Mail, Phone, Shield, Key, Save, Loader2, Clock, Calendar as CalendarIcon } from 'lucide-react';

import { attendanceService } from '@/services/hrm/attendance.service';
import dynamic from 'next/dynamic';

const AttendanceStats = dynamic(() => import('@/components/attendance/AttendanceStats'), {
  loading: () => <p>Đang tải...</p>,
  ssr: false
});

const LeaveRegistrationTab = dynamic(() => import('@/components/profile/LeaveRegistrationTab'), {
  loading: () => <p>Đang tải...</p>,
  ssr: false
});

export default function ProfilePage() {
  const { user: authUser, initialize } = useAuthStore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'password' | 'attendance' | 'leave'>('info');

  // Attendance State
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [checking, setChecking] = useState(false); // Loading state for check-in/out

  // Form states
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchTodayAttendance();
  }, []);

  const fetchTodayAttendance = async () => {
      try {
          const data = await attendanceService.getMyToday();
          setTodayAttendance(data);
      } catch (error) {
          // Silent fail or UI indicator
      }
  };

  const handleCheckIn = async () => {
    setChecking(true);
    try {
        const data = await attendanceService.checkIn();
        setTodayAttendance(data);
        
        if (data.status === 'LATE') {
            toast.warning("Check-in thành công. Bạn đã đi muộn!");
        } else {
            toast.success("Check-in thành công. Đúng giờ!");
        }
    } catch (error: any) {
        const msg = error.response?.data?.message || error.message || "Check-in thất bại";
        toast.error(msg);
        
        // If already checked in, re-fetch to update UI
        if (msg.includes('Already checked in') || msg.includes('đã điểm danh')) {
            fetchTodayAttendance();
        }
    } finally {
        setChecking(false);
    }
  };

  const handleCheckOut = async () => {
    setChecking(true);
    try {
        const data = await attendanceService.checkOut();
        setTodayAttendance(data);
        toast.success("Check-out thành công!");
    } catch (error: any) {
        toast.error(error.message || "Check-out thất bại");
    } finally {
        setChecking(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const data = await IamService.getProfile();
      setUser(data);
      setFullName(data.fullName);
      setPhoneNumber(data.phoneNumber);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Không thể tải thông tin cá nhân');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedUser = await IamService.updateProfile({
        fullName,
        phoneNumber
      });
      setUser(updatedUser);
      // Update auth store if needed (optional, but good for consistency)
      // initialize(); 
      toast.success('Cập nhật thông tin thành công');
    } catch (error: any) {
      console.error('Update info error:', error);
      toast.error(error.message || 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    if (password.length < 6) {
        toast.error('Mật khẩu phải có ít nhất 6 ký tự');
        return;
    }

    setSaving(true);
    try {
      await IamService.updateProfile({
        password
      });
      setPassword('');
      setConfirmPassword('');
      toast.success('Đổi mật khẩu thành công');
    } catch (error: any) {
      console.error('Change password error:', error);
      toast.error(error.message || 'Đổi mật khẩu thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
      return <div className="text-center py-10">Không tìm thấy thông tin người dùng.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Hồ sơ cá nhân</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar Info Card */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center">
            <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {user.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{user.fullName}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{user.email}</p>
            
            <div className="flex flex-wrap gap-2 justify-center">
                {user.roles?.map(role => (
                    <span key={role.id} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full border border-blue-100 dark:border-blue-800">
                        {role.name}
                    </span>
                ))}
            </div>

            <div className="mt-6 border-t border-gray-100 dark:border-gray-700 pt-6">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Chấm công hôm nay</h3>
                
                {loading ? (
                    <div className="flex justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {!todayAttendance ? (
                            <button
                                onClick={handleCheckIn}
                                disabled={checking}
                                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock size={16} />}
                                Check-in
                            </button>
                        ) : !todayAttendance.checkOut ? (
                            <div className="space-y-2">
                                <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                                    Đã Check-in: <span className="font-medium text-gray-900 dark:text-white">
                                        {todayAttendance.checkIn ? new Date(todayAttendance.checkIn).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                    </span>
                                </div>
                                <button
                                    onClick={handleCheckOut}
                                    disabled={checking || !!todayAttendance.checkOut}
                                    className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock size={16} />}
                                    Check-out
                                </button>
                            </div>
                        ) : (
                            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Hoàn thành công việc</p>
                                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    {todayAttendance.workingHours} giờ làm việc
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
                  activeTab === 'info'
                    ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                    <UserIcon size={18} />
                    Thông tin cơ bản
                </div>
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
                  activeTab === 'password'
                    ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                    <Key size={18} />
                    Bảo mật
                </div>
              </button>
               <button
                onClick={() => setActiveTab('attendance')}
                className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
                  activeTab === 'attendance'
                    ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                    <Clock size={18} />
                    Công & Lương
                </div>
              </button>
               <button
                onClick={() => setActiveTab('leave')}
                className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
                  activeTab === 'leave'
                    ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                    <CalendarIcon size={18} />
                    Xin nghỉ phép
                </div>
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'info' && (
                <form onSubmit={handleUpdateInfo} className="space-y-4">
                  {/* ... Info Form Content ... */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Họ và tên
                    </label>
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10 w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                        />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Số điện thoại
                    </label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="pl-10 w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email (Không thể thay đổi)
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <input
                        type="email"
                        value={user.email}
                        disabled
                        className="pl-10 w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                      Lưu thay đổi
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'password' && (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                        <Key className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                        minLength={6}
                        placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                        />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Xác nhận mật khẩu mới
                    </label>
                    <div className="relative">
                        <Shield className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                        placeholder="Nhập lại mật khẩu mới"
                        />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                      Đổi mật khẩu
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'attendance' && (
                <AttendanceStats />
              )}
               {activeTab === 'leave' && (
                <LeaveRegistrationTab />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
