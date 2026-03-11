import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { attendanceService, Attendance } from "@/services/hrm/attendance.service";
import { Loader2, Calendar as CalendarIcon, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function LeaveRegistrationTab() {
    const [date, setDate] = useState<string>('');
    const [reason, setReason] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<Attendance[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    // Lấy lịch sử nghỉ phép từ API
    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const data = await attendanceService.getMyHistory();
            // Lọc các bản ghi LEAVE (Nghỉ phép) và sắp xếp mới nhất lên đầu
            setHistory(data.filter(d => d.status === 'LEAVE').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !reason) {
            toast.error("Vui lòng chọn ngày và nhập lý do");
            return;
        }

        setLoading(true);
        try {
            // Gọi API đăng ký nghỉ phép
            await attendanceService.registerLeave(date, reason);
            toast.success("Đăng ký nghỉ phép thành công");
            
            // Reset form và tải lại lịch sử
            setDate('');
            setReason('');
            fetchHistory();
        } catch (error: any) {
            // Hiển thị lỗi từ server nếu có
            toast.error(error.message || "Đăng ký thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-blue-600" />
                        Đăng ký nghỉ phép
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="leave-date">Ngày nghỉ</Label>
                            <Input 
                                id="leave-date" 
                                type="date" 
                                value={date} 
                                onChange={(e) => setDate(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="leave-reason">Lý do</Label>
                            <Textarea 
                                id="leave-reason" 
                                placeholder="Nhập lý do nghỉ phép..." 
                                value={reason} 
                                onChange={(e) => setReason(e.target.value)} 
                                required 
                            />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Gửi đơn đăng ký
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <History className="w-5 h-5 text-gray-600" />
                        Lịch sử nghỉ phép
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ngày</TableHead>
                                <TableHead>Lý do</TableHead>
                                <TableHead>Trạng thái</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loadingHistory ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-4">
                                        <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-600" />
                                    </TableCell>
                                </TableRow>
                            ) : history.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                                        Chưa có lịch sử nghỉ phép
                                    </TableCell>
                                </TableRow>
                            ) : (
                                history.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell>{new Date(record.date).toLocaleDateString('vi-VN')}</TableCell>
                                        <TableCell>{record.note}</TableCell>
                                        <TableCell>
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                {record.status}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
