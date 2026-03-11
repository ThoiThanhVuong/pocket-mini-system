import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { payrollService } from "@/services/hrm/payroll.service";
import { toast } from "sonner";

interface PayrollEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    payroll: any;
    onSuccess: () => void;
}

export function PayrollEditModal({ isOpen, onClose, payroll, onSuccess }: PayrollEditModalProps) {
    const [formData, setFormData] = useState({
        totalWorkingDays: 0,
        totalNormalHours: 0,
        totalOtHours: 0,
        hourlyRate: 0,
        totalSalary: 0
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (payroll) {
            setFormData({
                totalWorkingDays: Number(payroll.totalWorkingDays) || 0,
                totalNormalHours: Number(payroll.totalNormalHours) || 0,
                totalOtHours: Number(payroll.totalOtHours) || 0,
                hourlyRate: Number(payroll.hourlyRate) || 0,
                totalSalary: Number(payroll.totalSalary) || 0
            });
        }
    }, [payroll]);

    // Recalculate total salary when inputs change
    const handleChange = (field: string, value: string) => {
        const numValue = parseFloat(value) || 0;
        setFormData(prev => {
            const newData = { ...prev, [field]: numValue };
            
            // Auto-calculate Total Salary if hours/rate change
            if (field !== 'totalSalary') {
                const normalPay = newData.totalNormalHours * newData.hourlyRate;
                const otPay = newData.totalOtHours * newData.hourlyRate * 1.5; // Assuming 1.5 OT Rate
                newData.totalSalary = normalPay + otPay;
            }
            return newData;
        });
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await payrollService.update(payroll.id, formData);
            toast.success("Payroll updated successfully");
            onSuccess();
            onClose();
        } catch (error) {
            toast.error("Failed to update payroll");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Payroll - {payroll?.user?.fullName}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Working Days</Label>
                        <Input 
                            type="number" 
                            className="col-span-3"
                            value={formData.totalWorkingDays}
                            onChange={(e) => handleChange('totalWorkingDays', e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Normal Hours</Label>
                        <Input 
                            type="number" 
                            className="col-span-3"
                            value={formData.totalNormalHours}
                            onChange={(e) => handleChange('totalNormalHours', e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">OT Hours</Label>
                        <Input 
                            type="number" 
                            className="col-span-3"
                            value={formData.totalOtHours}
                            onChange={(e) => handleChange('totalOtHours', e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Hourly Rate</Label>
                        <Input 
                            type="number" 
                            className="col-span-3"
                            value={formData.hourlyRate}
                            onChange={(e) => handleChange('hourlyRate', e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right font-bold">Total Salary</Label>
                        <Input 
                            type="number" 
                            className="col-span-3 font-bold"
                            value={formData.totalSalary}
                            onChange={(e) => handleChange('totalSalary', e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
