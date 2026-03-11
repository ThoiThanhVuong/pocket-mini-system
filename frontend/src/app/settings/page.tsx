'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Save, Settings } from "lucide-react";
import { systemConfigService } from '@/services/system/system-config.service';

const CONFIG_KEYS = [
    'WORK_START_HOUR',
    'WORK_HOURS_PER_DAY',
    'STANDARD_WORKING_DAYS',
    'OT_RATE'
];

export default function SystemSettingsPage() {
    const [configs, setConfigs] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        setLoading(true);
        try {
            const data = await systemConfigService.getConfigs(CONFIG_KEYS);
            // Ensure defaults if missing
            setConfigs({
                WORK_START_HOUR: data.WORK_START_HOUR || '7',
                WORK_HOURS_PER_DAY: data.WORK_HOURS_PER_DAY || '8',
                STANDARD_WORKING_DAYS: data.STANDARD_WORKING_DAYS || '26',
                OT_RATE: data.OT_RATE || '1.5'
            });
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải cấu hình hệ thống");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (key: string, value: string) => {
        setConfigs(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Update all configs
            // Using Promise.all for parallel updates
            const promises = Object.entries(configs).map(([key, value]) => 
                systemConfigService.updateConfig(key, value)
            );
            await Promise.all(promises);
            toast.success("Cập nhật cấu hình thành công");
        } catch (error) {
            console.error(error);
            toast.error("Cập nhật thất bại");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
         return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
             <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Settings className="w-8 h-8 text-blue-600" />
                    Cài đặt hệ thống
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Quản lý các tham số vận hành của hệ thống chấm công và tính lương.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Tham số Chấm công & Lương</CardTitle>
                    <CardDescription>
                        Các thay đổi tại đây sẽ ảnh hưởng trực tiếp đến việc tính công và lương của nhân viên.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="start-hour">Giờ vào làm (Standard Start Time)</Label>
                                <div className="relative">
                                    <Input // Using text/number input. 
                                        id="start-hour"
                                        type="number"
                                        min="0"
                                        max="23"
                                        value={configs.WORK_START_HOUR}
                                        onChange={(e) => handleInputChange('WORK_START_HOUR', e.target.value)}
                                        required
                                    />
                                    <span className="absolute right-3 top-2.5 text-gray-500 text-sm">giờ</span>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Nếu check-in sau giờ này sẽ bị tính là đi muộn (LATE).
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="work-hours">Số giờ làm việc / ngày</Label>
                                <div className="relative">
                                    <Input 
                                        id="work-hours"
                                        type="number"
                                        step="0.5"
                                        value={configs.WORK_HOURS_PER_DAY}
                                        onChange={(e) => handleInputChange('WORK_HOURS_PER_DAY', e.target.value)}
                                        required
                                    />
                                    <span className="absolute right-3 top-2.5 text-gray-500 text-sm">giờ</span>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Dùng để tính tăng ca. (Ví dụ: &gt; 8h là OT).
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="std-days">Số ngày công chuẩn / tháng</Label>
                                <div className="relative">
                                    <Input 
                                        id="std-days"
                                        type="number"
                                        value={configs.STANDARD_WORKING_DAYS}
                                        onChange={(e) => handleInputChange('STANDARD_WORKING_DAYS', e.target.value)}
                                        required
                                    />
                                    <span className="absolute right-3 top-2.5 text-gray-500 text-sm">ngày</span>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Dùng để quy đổi lương tháng ra dơn giá giờ.
                                </p>
                            </div>

                             <div className="space-y-2">
                                <Label htmlFor="ot-rate">Hệ số lương Tăng ca (OT Rate)</Label>
                                <div className="relative">
                                    <Input 
                                        id="ot-rate"
                                        type="number"
                                        step="0.1"
                                        value={configs.OT_RATE}
                                        onChange={(e) => handleInputChange('OT_RATE', e.target.value)}
                                        required
                                    />
                                    <span className="absolute right-3 top-2.5 text-gray-500 text-sm">x</span>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Ví dụ: 1.5 nghĩa là lương OT = 150% lương thường.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={saving}>
                                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                Lưu cấu hình
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
