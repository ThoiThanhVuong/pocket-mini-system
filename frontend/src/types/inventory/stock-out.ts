import { TransactionStatus } from './transaction-status';

export interface StockOutItem {
    id?: string;
    productId: string;
    quantity: number;
    price: number;
}

export interface StockOut {
    id: string;
    customerId: string;
    warehouseId: string;
    userId: string;
    referenceCode: string;
    status: TransactionStatus;
    items: StockOutItem[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export interface CreateStockOutDto {
    customerId: string;
    warehouseId: string;
    referenceCode: string;
    items: Omit<StockOutItem, 'id'>[];
    notes?: string;
}

export interface StockOutItemState {
  productId: string;
  quantity: number | '';
  unitPrice: number;
  availableStock?: number;
}

export interface StockOutState {
  currentStep: number;
  showSuccess: boolean;
  products: any[];
  warehouses: any[];
  customers: any[];
  stockOuts: any[];
  warehouseStock: any[];

  customerId: string;
  reason: string;
  warehouseId: string;
  referenceCode: string;
  date: string;
  notes: string;
  items: StockOutItemState[];
  isSubmitting: boolean;
  error: string | null;
  selectedViewId?: string | null;
  isFormExpanded?: boolean;
  totalItems?: number;
  currentPage: number;
  pageSize: number;
  search: string;
  filterWarehouseId: string;
  filterCustomerId: string;
}
