export interface Payment {
  id: string;
  referenceType: string;
  referenceId: string;
  amount: number;
  method?: string;
  paymentDescription?: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  paidAt?: string;
  createdAt: string;
}

export interface PaymentProcessRequest {
  method: string;
}

export interface PaymentsState {
  payments: Payment[];
  loading: boolean;
  filterStatus: 'ALL' | 'pending' | 'paid' | 'failed' | 'refunded';
  filterType: 'ALL' | 'stock_in' | 'stock_out';
  searchQuery: string;
}
