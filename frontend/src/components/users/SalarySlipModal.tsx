import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface SalarySlipModalProps {
    isOpen: boolean;
    onClose: () => void;
    payroll: any;
}

export function SalarySlipModal({ isOpen, onClose, payroll }: SalarySlipModalProps) {
    if (!payroll) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-white text-black p-0 print:border-none print:shadow-none print:p-0 print:m-0">
                <style>{`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #salary-slip-content, #salary-slip-content * {
                            visibility: visible;
                        }
                        #salary-slip-content {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            padding: 20px;
                        }
                        .print-hidden {
                            display: none !important;
                        }
                    }
                `}</style>

                <div className="p-6 pb-2 print-hidden flex justify-between items-center border-b">
                    <DialogTitle className="text-xl font-bold text-gray-800">Phiếu Lương</DialogTitle>
                    <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                        <Printer size={16} /> In Phiếu Lương
                    </Button>
                </div>

                <div id="salary-slip-content" className="p-8 bg-white min-h-[500px]">
                    <div className="text-center mb-8 border-b-2 border-gray-800 pb-4">
                        <h1 className="text-3xl font-black uppercase text-gray-900 tracking-wider">Phiếu Lương Nhân Sự</h1>
                        <p className="text-lg text-gray-600 mt-2 font-medium">Tháng {payroll.month} / Năm {payroll.year}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                        <div className="space-y-3">
                            <div className="flex bg-gray-50 p-2 rounded"><span className="w-32 font-bold text-gray-600">Họ và tên:</span> <span className="font-semibold text-gray-900">{payroll.user?.fullName}</span></div>
                            <div className="flex p-2"><span className="w-32 font-bold text-gray-600">Email:</span> <span>{payroll.user?.email}</span></div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex bg-gray-50 p-2 rounded"><span className="w-32 font-bold text-gray-600">Ngày tạo:</span> <span>{new Date(payroll.createdAt).toLocaleDateString('vi-VN')}</span></div>
                            <div className="flex p-2"><span className="w-32 font-bold text-gray-600">Trạng thái:</span> 
                                <span className="font-bold text-green-600 uppercase">
                                    {payroll.status === 'PAID' ? 'Đã Thanh Toán' : payroll.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden mb-8 shadow-sm">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-800 text-white">
                                <tr>
                                    <th className="p-4 font-semibold w-2/3">Khoản mục</th>
                                    <th className="p-4 font-semibold text-right">Số lượng / Số tiền</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-gray-800">
                                <tr className="hover:bg-gray-50">
                                    <td className="p-4">Lương cơ bản (Base Salary)</td>
                                    <td className="p-4 text-right font-medium">{Number(payroll.baseSalary || 0).toLocaleString('vi-VN')} ₫</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="p-4 text-gray-600">Số ngày làm việc thực tế</td>
                                    <td className="p-4 text-right">{payroll.totalWorkingDays} ngày</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="p-4 text-gray-600">Số giờ làm bình thường</td>
                                    <td className="p-4 text-right">{payroll.totalNormalHours} giờ</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="p-4 text-gray-600">Số giờ tăng ca (OT)</td>
                                    <td className="p-4 text-right">{payroll.totalOtHours} giờ</td>
                                </tr>
                            </tbody>
                            <tfoot className="bg-blue-50 border-t-2 border-gray-800">
                                <tr>
                                    <td className="p-4 font-bold text-lg text-gray-900 uppercase">Tổng Thực Lãnh (Total Salary)</td>
                                    <td className="p-4 text-right font-black text-xl text-blue-700">{Number(payroll.totalSalary || 0).toLocaleString('vi-VN')} ₫</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="grid grid-cols-2 mt-16 pt-8">
                        <div className="text-center">
                            <p className="font-bold text-gray-800 mb-16">Nhân viên xác nhận</p>
                            <p className="border-t border-gray-300 mx-12 pt-2 text-sm text-gray-500">(Ký và ghi rõ họ tên)</p>
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-gray-800 mb-16">Giám đốc / Quản lý</p>
                            <p className="border-t border-gray-300 mx-12 pt-2 text-sm text-gray-500">(Ký và ghi rõ họ tên)</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
