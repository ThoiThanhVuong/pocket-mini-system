export interface Transaction {
  id: string;
  type: 'IN' | 'OUT' | 'TRANSFER';
  referenceCode: string;
  warehouseId?: string;
  fromWarehouseId?: string;
  toWarehouseId?: string;
  status: string;
  paymentStatus?: string;
  createdAt: string;
}
export interface TransactionsState {
  transactions: Transaction[];
  warehouses: any[];
  loading: boolean;
  filterType: 'ALL' | 'IN' | 'OUT' | 'TRANSFER';
  filterStatus: 'ALL' | 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';
  searchQuery: string;
}
