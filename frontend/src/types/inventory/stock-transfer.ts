import { TransactionStatus } from './transaction-status';

export interface StockTransferItem {
    id?: string;
    productId: string;
    quantity: number;
}

export interface StockTransfer {
    id: string;
    fromWarehouseId: string;
    toWarehouseId: string;
    userId: string;
    referenceCode: string;
    status: TransactionStatus;
    items: StockTransferItem[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export interface CreateStockTransferDto {
    fromWarehouseId: string;
    toWarehouseId: string;
    referenceCode: string;
    items: Omit<StockTransferItem, 'id'>[];
    notes?: string;
}

export interface StockTransferState {
  currentStep: number;
  showSuccess: boolean;
  searchQuery: string;
  selectedProduct: any | null;
  fromWarehouse: string;
  toWarehouse: string;
  quantity: number | '';
  notes: string;
  warehouses: any[];
  allWarehouses: any[];
  products: any[];
  transfers: any[];
  
  availableStock: number | null;
  warehouseStock: any[];
  isSubmitting: boolean;
  error: string | null;
  selectedViewId?: string | null;
  isFormExpanded?: boolean;
  
  // Pagination and Filters
  totalItems: number;
  currentPage: number;
  search: string;
  filterFromWarehouseId: string;
  filterToWarehouseId: string;
  printingId?: string | null;
}
