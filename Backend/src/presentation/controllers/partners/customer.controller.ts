import { Controller, Post, Get, Put, Delete, Body, Param, Query, Inject, UseGuards, NotFoundException, UseInterceptors, UploadedFile, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ExcelService } from '../../../application/use-cases/system/excel.service';
import { AuthGuard } from '@nestjs/passport';
import { ICustomerServiceKey } from '../../../core/interfaces/services/partners/customer.service.interface';
import type{ICustomerService} from '../../../core/interfaces/services/partners/customer.service.interface';
import { CreateCustomerDto } from '../../../application/dtos/partners/create-customer.dto';
import { UpdateCustomerDto } from '../../../application/dtos/partners/update-customer.dto';
import { CustomerMapper } from '../../../application/mappers/customer.mapper';
import { PermissionsGuard } from '../../../infrastructure/auth/guards/permissions.guard';
import { RequirePermissions } from '../../../infrastructure/auth/decorators/require-permissions.decorator';
import { PermissionCode } from '../../../core/domain/enums/permission-code.enum';

@Controller('customers')
@UseGuards(AuthGuard('jwt'), PermissionsGuard) 
export class CustomerController {
    constructor(
        @Inject(ICustomerServiceKey)
        private readonly customerService: ICustomerService
    ) {}

    @Post('import')
    @RequirePermissions(PermissionCode.CUSTOMER_CREATE)
    @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
    async importCustomers(@UploadedFile() file: any, @Inject(ExcelService) excelService: ExcelService) {
        if (!file) throw new HttpException('File không hợp lệ', HttpStatus.BAD_REQUEST);
        const data = await excelService.parseExcel(file.buffer);
        let count = 0;
        for (const row of data) {
            try {
                await this.customerService.createCustomer(
                    row['Tên khách hàng'] || row['name'] || 'New Customer',
                    row['Email'] || row['email'] || '',
                    row['Số điện thoại'] || row['phone'] || '',
                    row['Địa chỉ'] || row['address'] || '',
                    row['Loại khách hàng'] || row['customerType'] || 'Individual',
                    row['Tên công ty'] || row['companyName'] || '',
                    row['Cấp bậc'] || row['loyaltyTier'] || 'Chưa phân hạng',
                    row['Trạng thái'] || row['status'] || 'Active'
                );
                count++;
            } catch (e) {
                console.error('Import error for row:', row, e);
            }
        }
        return { message: `Đã nhập thành công ${count} khách hàng.` };
    }

    @Post()
    @RequirePermissions(PermissionCode.CUSTOMER_CREATE)
    async create(@Body() dto: CreateCustomerDto) {
        const customer = await this.customerService.createCustomer(
            dto.name, 
            dto.email, 
            dto.phone, 
            dto.address, 
            dto.customerType,
            dto.companyName,
            dto.loyaltyTier,
            dto.status
        );
        return CustomerMapper.toResponse(customer);
    }

    @Get()
    @RequirePermissions(PermissionCode.CUSTOMER_VIEW)
    async findAll(@Query('search') search?: string, @Query('status') status?: string, @Query('customerType') customerType?: string) {
        const customers = await this.customerService.getAllCustomers(search, status, customerType);
        return customers.map(c => CustomerMapper.toResponse(c));
    }

    @Get(':id')
    @RequirePermissions(PermissionCode.CUSTOMER_VIEW)
    async findOne(@Param('id') id: string) {
        const customer = await this.customerService.getCustomerById(id);
        if (!customer) throw new NotFoundException('Customer not found');
        return CustomerMapper.toResponse(customer);
    }

    @Put(':id')
    @RequirePermissions(PermissionCode.CUSTOMER_UPDATE)
    async update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
        const customer = await this.customerService.updateCustomer(id, {
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
            address: dto.address,
            customerType: dto.customerType,
            companyName: dto.companyName,
            loyaltyTier: dto.loyaltyTier,
            status: dto.status
        } as any);
        return CustomerMapper.toResponse(customer);
    }

    @Delete(':id')
    @RequirePermissions(PermissionCode.CUSTOMER_DELETE)
    async remove(@Param('id') id: string) {
        return await this.customerService.deleteCustomer(id);
    }
}
