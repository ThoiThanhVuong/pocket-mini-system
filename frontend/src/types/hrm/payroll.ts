export interface Payroll {
  id: string;
  userId: string;
  month: number;
  year: number;
  totalWorkingDays: number;
  baseSalary: number;
  totalSalary: number;
  status: 'DRAFT' | 'FINALIZED' | 'PAID';
  createdAt: string;
  updatedAt: string;
}