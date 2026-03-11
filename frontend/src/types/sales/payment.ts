export interface Payment {
  id: string;
  orderId: string;
  customerName: string;
  amount: number;
  method: string;
  transactionDate: string;
  reference: string;
  notes: string;
  status: string;
}
