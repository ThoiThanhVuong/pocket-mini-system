export interface Inventory {
    id: string;
    warehouseId: string;
    productId: string;
    quantity: number;
}

export interface StockItemResponse {
    warehouseId: string;
    productId: string;
    quantity: number;
}
