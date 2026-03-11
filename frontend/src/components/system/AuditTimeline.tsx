'use client';
import React, { useState, useEffect } from 'react';
import { History, CheckCircle2, AlertCircle, XCircle, PlayCircle, PlusCircle, User, Clock } from 'lucide-react';
import { AuditService, AuditLogItem } from '@/services/system/audit.service';
import { motion } from 'framer-motion';

interface Props {
    entityType: string;
    entityId: string;
}

const actionIcons: Record<string, any> = {
    CREATE: <PlusCircle size={16} className="text-blue-500" />,
    APPROVE: <CheckCircle2 size={16} className="text-amber-500" />,
    COMPLETE: <CheckCircle2 size={16} className="text-emerald-500" />,
    CANCEL: <XCircle size={16} className="text-red-500" />,
    UPDATE: <PlayCircle size={16} className="text-blue-400" />,
};

const actionLabels: Record<string, string> = {
    CREATE: 'Đã tạo mới',
    APPROVE: 'Đã duyệt phiếu',
    COMPLETE: 'Đã hoàn thành',
    CANCEL: 'Đã huỷ phiếu',
    UPDATE: 'Cập nhật thông tin',
};

export function AuditTimeline({ entityType, entityId }: Props) {
    const [logs, setLogs] = useState<AuditLogItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadLogs();
    }, [entityType, entityId]);

    const loadLogs = async () => {
        try {
            setIsLoading(true);
            const data = await AuditService.getHistory(entityType, entityId);
            setLogs(data || []);
        } catch (error) {
            console.error('Failed to load audit logs', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                <History size={18} className="text-indigo-500" />
                <h3 className="font-semibold text-gray-800 dark:text-white">Lịch sử hoạt động</h3>
            </div>

            <div className="p-6">
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                        Chưa có lịch sử hoạt động nào.
                    </div>
                ) : (
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-z-10 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gray-100 before:via-gray-100 before:to-transparent dark:before:from-gray-700 dark:before:via-gray-700">
                        {logs.map((log, idx) => (
                            <motion.div 
                                key={log.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="relative pl-10"
                            >
                                <div className="absolute left-0 mt-1 w-8 h-8 rounded-full border-4 border-white dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex items-center justify-center z-10 shadow-sm">
                                    {actionIcons[log.action] || <AlertCircle size={16} />}
                                </div>
                                
                                <div className="flex flex-col">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                            {actionLabels[log.action] || log.action}
                                        </span>
                                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-gray-500">
                                            <Clock size={10} />
                                            {new Date(log.createdAt).toLocaleString('vi-VN')}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 mb-2">
                                        <User size={12} className="text-gray-400" />
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {log.user?.fullName || 'Hệ thống'}
                                        </span>
                                    </div>

                                    {log.changes && Object.keys(log.changes).length > 0 && (
                                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2 text-[11px] text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700/50">
                                            <div className="grid grid-cols-1 gap-1">
                                                {Object.entries(log.changes).map(([key, val]) => (
                                                    <div key={key} className="flex gap-2">
                                                        <span className="font-semibold text-gray-400 dark:text-gray-500 uppercase">{key}:</span>
                                                        <span className="truncate">{JSON.stringify(val)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
