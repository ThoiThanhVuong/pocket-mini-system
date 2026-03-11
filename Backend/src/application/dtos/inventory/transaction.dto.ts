export class TransactionDto {
    id: string;
    type: 'IN' | 'OUT' | 'TRANSFER';
    referenceCode: string;
    warehouseId?: string;
    fromWarehouseId?: string;
    toWarehouseId?: string;
    status: string;
    paymentStatus?: string;
    createdAt: Date;
}
