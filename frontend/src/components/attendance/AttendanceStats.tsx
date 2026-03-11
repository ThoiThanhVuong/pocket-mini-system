import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { attendanceService, Attendance } from '@/services/hrm/attendance.service';
import { Loader2, Calendar, Clock, CheckCircle, AlertCircle, Pencil } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AttendanceStatsProps {
    userId?: string; // If provided, fetch for this user (Admin view)
}

export default function AttendanceStats({ userId }: AttendanceStatsProps = {}) {
    const [history, setHistory] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(false);
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [summary, setSummary] = useState({ totalDays: 0, totalHours: 0, lateCount: 0 });

    const [editingRecord, setEditingRecord] = useState<Attendance | null>(null);
    const [editForm, setEditForm] = useState<Partial<Attendance>>({});

    useEffect(() => {
        fetchHistory();
    }, [month, year]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const data = userId 
                ? await attendanceService.getUserHistory(userId, month, year)
                : await attendanceService.getMyHistory(month, year);
            setHistory(data);
            calculateSummary(data);
        } catch (error) {
            console.error("Failed to fetch attendance history", error);
            toast.error("Không thể tải lịch sử chấm công");
        } finally {
            setLoading(false);
        }
    };

    const calculateSummary = (data: Attendance[]) => {
        let totalHours = 0;
        let lateCount = 0;
        data.forEach(item => {
            const hours = Number(item.workingHours) || 0;
            totalHours += hours;
            if (item.status === 'LATE') lateCount++;
        });

        setSummary({
            totalDays: data.length,
            totalHours: parseFloat(totalHours.toFixed(2)),
            lateCount
        });
    };

    const getStatusColor = (status: string) => {
         switch (status) {
            case 'PRESENT': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
            case 'LATE': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
            case 'ABSENT': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
            case 'LEAVE': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const formatTime = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });
    };

    const handleEditClick = (record: Attendance) => {
        setEditingRecord(record);
        setEditForm({
            checkIn: record.checkIn,
            checkOut: record.checkOut,
            overtimeHours: record.overtimeHours,
            note: record.note
        });
    };

    const handleSaveEdit = async () => {
        if (!editingRecord) return;
        try {
            await attendanceService.update(editingRecord.id, editForm);
            toast.success("Cập nhật thành công");
            setEditingRecord(null);
            fetchHistory(); 
        } catch (error) {
            toast.error("Cập nhật thất bại");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    Lịch sử chấm công
                </h3>
                <div className="flex gap-2">
                    <Select value={month.toString()} onValueChange={(v) => setMonth(Number(v))}>
                        <SelectTrigger className="w-[110px]">
                            <SelectValue placeholder="Tháng" />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                <SelectItem key={m} value={m.toString()}>Tháng {m}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                     <Select value={year.toString()} onValueChange={(v) => setYear(Number(v))}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Năm" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2025">2025</SelectItem>
                            <SelectItem value="2026">2026</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Tổng ngày công</p>
                            <p className="text-2xl font-bold">{summary.totalDays}</p>
                        </div>
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                            <CheckCircle size={24} />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Tổng giờ làm</p>
                            <p className="text-2xl font-bold">{summary.totalHours}</p>
                        </div>
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                            <Clock size={24} />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Đi muộn</p>
                            <p className="text-2xl font-bold">{summary.lateCount}</p>
                        </div>
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600 dark:text-orange-400">
                            <AlertCircle size={24} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* History Table */}
            <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[150px]">Ngày</TableHead>
                            <TableHead>Check-in</TableHead>
                            <TableHead>Check-out</TableHead>
                            <TableHead>Giờ làm</TableHead>
                            <TableHead>Tăng ca (OT)</TableHead>
                            <TableHead className="text-right">Trạng thái</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                             <TableRow key="loading">
                                <TableCell colSpan={7} className="text-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                                </TableCell>
                            </TableRow>
                        ) : history.length === 0 ? (
                            <TableRow key="no-data">
                                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                    Chưa có dữ liệu chấm công tháng này
                                </TableCell>
                            </TableRow>
                        ) : (
                            history.map((item, index) => (
                                <TableRow key={item.id || index}>
                                    <TableCell className="font-medium">{formatDate(item.date)}</TableCell>
                                    <TableCell>{formatTime(item.checkIn)}</TableCell>
                                    <TableCell>{formatTime(item.checkOut)}</TableCell>
                                    <TableCell>{item.workingHours}h</TableCell>
                                    <TableCell className="text-orange-600 font-semibold">{item.overtimeHours ? `${item.overtimeHours}h` : '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="icon" onClick={() => handleEditClick(item)}>
                                                    <Pencil className="w-4 h-4 text-gray-500 hover:text-blue-600" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Sửa chấm công - {formatDate(item.date)}</DialogTitle>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label className="text-right">Check In</Label>
                                                        <Input 
                                                            className="col-span-3" 
                                                            type="datetime-local" 
                                                            value={editForm.checkIn ? new Date(editForm.checkIn).toISOString().slice(0, 16) : ''}
                                                            onChange={(e) => setEditForm({...editForm, checkIn: e.target.value})}
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label className="text-right">Check Out</Label>
                                                        <Input 
                                                            className="col-span-3" 
                                                            type="datetime-local"
                                                            value={editForm.checkOut ? new Date(editForm.checkOut).toISOString().slice(0, 16) : ''}
                                                            onChange={(e) => setEditForm({...editForm, checkOut: e.target.value})}
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label className="text-right">Overtime (h)</Label>
                                                        <Input 
                                                            className="col-span-3" 
                                                            type="number" 
                                                            step="0.1"
                                                            value={editForm.overtimeHours || 0}
                                                            onChange={(e) => setEditForm({...editForm, overtimeHours: parseFloat(e.target.value)})}
                                                        />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button onClick={handleSaveEdit}>Lưu thay đổi</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
