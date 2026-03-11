import { TransactionStatus } from './transaction-status';

export interface StockInItem {
    id?: string;
    productId: string;
    quantity: number;
    price: number;
}

export interface StockIn {
    id: string;
    supplierId: string;
    warehouseId: string;
    userId: string;
    referenceCode: string;
    status: TransactionStatus;
    items: StockInItem[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export interface CreateStockInDto {
    supplierId: string;
    warehouseId: string;
    referenceCode: string;
    items: Omit<StockInItem, 'id'>[];
    notes?: string;
}

export interface StockInItemState {
  productId: string;
  quantity: number | '';
  unitCost: number | '';
}

export interface StockInState {
  currentStep: number;
  showSuccess: boolean;
  suppliers: any[];
  products: any[];
  warehouses: any[];
  stockIns: any[];
  
  supplierId: string;
  warehouseId: string;
  referenceCode: string;
  date: string;
  notes: string;
  items: StockInItemState[];
  isSubmitting: boolean;
  error: string | null;
  selectedViewId?: string | null;
  isFormExpanded?: boolean;
}