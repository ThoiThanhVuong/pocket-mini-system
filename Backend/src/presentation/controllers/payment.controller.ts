import { Controller, Get, Post, Body, Param, UseGuards, Inject, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IPaymentServiceKey } from '../../core/interfaces/services/payment.service.interface';
import type { IPaymentService } from '../../core/interfaces/services/payment.service.interface';
import { PermissionsGuard } from '../../infrastructure/auth/guards/permissions.guard';

@Controller('payments')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class PaymentController {
    constructor(
        @Inject(IPaymentServiceKey)
        private readonly paymentService: IPaymentService,
    ) {}

    @Get()
    // Add appropriate permissions here, e.g. PAYMENT_VIEW or FINANCE_VIEW
    async findAll() {
        return this.paymentService.getAllPayments();
    }

    @Get('reference/:refId')
    async findByReference(@Param('refId') refId: string) {
        return this.paymentService.getPaymentsByReference(refId);
    }

    @Post()
    async createManualPayment(@Body() body: any) {
        const { type, amount, method, paymentDescription } = body;
        if (!type || !['manual_income', 'manual_expense'].includes(type)) {
            throw new BadRequestException('Loại giao dịch không hợp lệ');
        }
        if (!amount || amount <= 0) throw new BadRequestException('Số tiền không hợp lệ');
        if (!method) throw new BadRequestException('Cần cung cấp phương thức thanh toán');

        const referenceId = `MANUAL-${Date.now()}`;
        
        const dto = {
            referenceType: type,
            referenceId,
            amount: Number(amount),
            paymentDescription,
            method
        };

        const payment = await this.paymentService.createPayment(dto);
        const result = await this.paymentService.markAsPaid(payment.id, method);
        
        return { message: 'Tạo khoản thu/chi thành công', data: result };
    }

    @Post(':id/pay')
    // Add appropriate permissions here, e.g. PAYMENT_PROCESS
    async markAsPaid(@Param('id') id: string, @Body('method') method: string) {
        if (!method) throw new BadRequestException('Cần cung cấp phương thức thanh toán (method)');
        const result = await this.paymentService.markAsPaid(id, method);
        return { message: 'Xác nhận thanh toán thành công', result };
    }

    @Post('reference/:refId/pay')
    async markAsPaidByReference(@Param('refId') refId: string, @Body('method') method: string) {
        if (!method) throw new BadRequestException('Cần cung cấp phương thức thanh toán (method)');
        const payments = await this.paymentService.getPaymentsByReference(refId);
        if (!payments || payments.length === 0) throw new BadRequestException('Không tìm thấy khoản thanh toán cho phiếu này');
        
        const payment = payments[0]; // Assuming 1 payment per reference
        if (payment.status === 'paid') throw new BadRequestException('Phiếu này đã được thanh toán');
        
        const result = await this.paymentService.markAsPaid(payment.id, method);
        return { message: 'Xác nhận thanh toán thành công', result };
    }
}
