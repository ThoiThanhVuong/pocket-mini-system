import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { payrollService } from "@/services/hrm/payroll.service";
import { UserService } from "@/services/iam/user.service";
import { toast } from "sonner";
import { Loader2, Calculator, Pencil, Calendar, Printer } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { PayrollEditModal } from "@/components/users/PayrollEditModal";
import { SalarySlipModal } from "@/components/users/SalarySlipModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AttendanceStats from "@/components/attendance/AttendanceStats";

export default function SalaryTab() {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  
  // Modal states
  const [editingPayroll, setEditingPayroll] = useState<any>(null);
  const [printingPayroll, setPrintingPayroll] = useState<any>(null);
  const [viewingUser, setViewingUser] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [month, year]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, payrollsData] = await Promise.all([
        UserService.getAllUsers(),
        payrollService.getMonthlyList(month, year)
      ]);
      setUsers(usersData);
      setPayrolls(payrollsData);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateSalary = async (userId: string) => {
    try {
        toast.info("Calculating...");
        await payrollService.calculateSalary(userId, month, year);
        toast.success("Salary calculated successfully");
        fetchData();
    } catch (error) {
        toast.error("Failed to calculate salary");
    }
  };

  const getPayrollForUser = (userId: string) => {
      return payrolls.find(p => p.userId === userId);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Monthly Payroll</h2>
        <div className="flex gap-2">
            <Select value={month.toString()} onValueChange={(v) => setMonth(Number(v))}>
                <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <SelectItem key={m} value={m.toString()}>Month {m}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
             <Select value={year.toString()} onValueChange={(v) => setYear(Number(v))}>
                <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Base Salary (Type)</TableHead>
                <TableHead>Work Days</TableHead>
                <TableHead>Normal (h)</TableHead>
                <TableHead>OT (h)</TableHead>
                <TableHead>Total Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    <Loader2 className="animate-spin h-6 w-6 mx-auto" />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                    const payroll = getPayrollForUser(user.id);
                    // Determine display values
                    console.log(`User: ${user.fullName}, Base: ${user.baseSalary}, RoleBase: ${user.roles?.[0]?.baseSalary}, PayrollBase: ${payroll?.baseSalary}`);
                    const displayBaseSalary = payroll ? Number(payroll.baseSalary) : (user.baseSalary > 0 ? user.baseSalary : (user.roles?.[0]?.baseSalary || 0));
                    const displaySalaryType = payroll ? '' : (user.salaryType || user.roles?.[0]?.salaryType || 'MONTHLY');

                    return (
                        <TableRow key={user.id}>
                            <TableCell>
                                <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded" onClick={() => setViewingUser(user.id)}>
                                    <Calendar className="w-4 h-4 text-blue-500" />
                                    <div>
                                        <div className="font-medium text-blue-600 hover:underline">{user.fullName}</div>
                                        <div className="text-xs text-gray-500">{user.email}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div>{Number(displayBaseSalary).toLocaleString()}</div>
                                <div className="text-xs text-gray-400">{displaySalaryType}</div>
                            </TableCell>
                            <TableCell>{payroll ? payroll.totalWorkingDays : '-'}</TableCell>
                            <TableCell>{payroll ? payroll.totalNormalHours : '-'}</TableCell>
                            <TableCell className="text-orange-600 font-medium">{payroll ? payroll.totalOtHours : '-'}</TableCell>
                            <TableCell className="font-bold text-green-600">
                                {payroll ? Number(payroll.totalSalary).toLocaleString() : '-'}
                            </TableCell>
                            <TableCell>
                                {payroll ? (
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        payroll.status === 'PAID' ? 'bg-green-100 text-green-800' :
                                        payroll.status === 'FINALIZED' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {payroll.status}
                                    </span>
                                ) : (
                                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-500">
                                        Not Calculated
                                    </span>
                                )}
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button 
                                        variant={payroll ? "outline" : "default"}
                                        size="icon"
                                        className="h-8 w-8"
                                        title={payroll ? "Recalculate" : "Calculate"}
                                        onClick={() => handleCalculateSalary(user.id)}
                                        disabled={payroll?.status === 'PAID'}
                                    >
                                        <Calculator className="w-4 h-4" />
                                    </Button>
                                    {payroll && (
                                        <>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-blue-600"
                                            title="Edit Payroll"
                                            disabled={payroll?.status === 'PAID'}
                                            onClick={() => setEditingPayroll(payroll)}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-gray-600"
                                            title="Print Payroll"
                                            onClick={() => setPrintingPayroll(payroll)}
                                        >
                                            <Printer className="w-4 h-4" />
                                        </Button>
                                        </>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Payroll Modal */}
      {editingPayroll && (
        <PayrollEditModal 
            isOpen={!!editingPayroll}
            onClose={() => setEditingPayroll(null)}
            payroll={editingPayroll}
            onSuccess={fetchData}
        />
      )}

      {/* User Attendance Detail Modal */}
      <Dialog open={!!viewingUser} onOpenChange={(open) => !open && setViewingUser(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Attendance Details</DialogTitle>
            </DialogHeader>
            {viewingUser && <AttendanceStats userId={viewingUser} />}
        </DialogContent>
      </Dialog>

      {/* Print Payroll Modal */}
      {printingPayroll && (
        <SalarySlipModal
            isOpen={!!printingPayroll}
            onClose={() => setPrintingPayroll(null)}
            payroll={printingPayroll}
        />
      )}
    </div>
  );
}
