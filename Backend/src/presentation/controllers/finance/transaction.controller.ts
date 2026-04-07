import { Controller, Get, Post, Body, Param, Query, UseGuards, Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ITransactionServiceKey } from '../../../core/interfaces/services/finance/transaction.service.interface';
import type { ITransactionService } from '../../../core/interfaces/services/finance/transaction.service.interface';
import { PermissionsGuard } from '../../../infrastructure/auth/guards/permissions.guard';
import { RequirePermissions } from '../../../infrastructure/auth/decorators/require-permissions.decorator';
import { PermissionCode } from '../../../core/domain/enums/permission-code.enum';

@Controller('transactions')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class TransactionController {
    constructor(
        @Inject(ITransactionServiceKey)
        private readonly transactionService: ITransactionService,
    ) {}

    @Get()
    @RequirePermissions(PermissionCode.STOCK_VIEW)
    async findAll(
        @Query('warehouseId') warehouseId?: string,
        @Query('status') status?: string,
        @Query('type') type?: string,
        @Query('search') search?: string,
    ) {
        return this.transactionService.getAllTransactions(warehouseId, status, type, search);
    }

    @Post(':id/approve')
    @RequirePermissions(PermissionCode.STOCK_IN_APPROVE) // Temporary, should ideally be role-based per type or a generic TRANSACTION_APPROVE
    async approve(@Param('id') id: string, @Body('type') type: 'IN' | 'OUT' | 'TRANSFER') {
        const result = await this.transactionService.approveTransaction(id, type);
        return { message: 'Phiếu đã được duyệt thành công.', result };
    }

    @Post(':id/complete')
    @RequirePermissions(PermissionCode.STOCK_IN_COMPLETE)
    async complete(@Param('id') id: string, @Body('type') type: 'IN' | 'OUT' | 'TRANSFER') {
        const result = await this.transactionService.completeTransaction(id, type);
        return { message: 'Phiếu đã được hoàn thành.', result };
    }

    @Post(':id/cancel')
    @RequirePermissions(PermissionCode.STOCK_IN_CANCEL)
    async cancel(@Param('id') id: string, @Body('type') type: 'IN' | 'OUT' | 'TRANSFER') {
        const result = await this.transactionService.cancelTransaction(id, type);
        return { message: 'Phiếu đã bị hủy.', result };
    }
}
