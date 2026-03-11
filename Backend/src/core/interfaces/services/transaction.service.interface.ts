import { TransactionDto } from '../../../application/dtos/inventory/transaction.dto';

export const ITransactionServiceKey = 'ITransactionService';

export interface ITransactionService {
    getAllTransactions(warehouseId?: string, status?: string, type?: string, search?: string): Promise<TransactionDto[]>;
    approveTransaction(id: string, type: 'IN' | 'OUT' | 'TRANSFER'): Promise<any>;
    completeTransaction(id: string, type: 'IN' | 'OUT' | 'TRANSFER'): Promise<any>;
    cancelTransaction(id: string, type: 'IN' | 'OUT' | 'TRANSFER'): Promise<any>;
}
