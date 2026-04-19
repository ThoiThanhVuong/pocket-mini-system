import { Controller, Post, Get, Put, Delete, Body, Param, Query, Inject, UseGuards, NotFoundException, UseInterceptors, UploadedFile, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ExcelService } from '../../../application/use-cases/system/excel.service';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../../infrastructure/auth/guards/permissions.guard';
import { RequirePermissions } from '../../../infrastructure/auth/decorators/require-permissions.decorator';
import { PermissionCode } from '../../../core/domain/enums/permission-code.enum';
import type { ISupplierService } from '../../../core/interfaces/services/partners/supplier.service.interface';
import { ISupplierServiceKey } from '../../../core/interfaces/services/partners/supplier.service.interface';
import { CreateSupplierDto } from '../../../application/dtos/partners/create-supplier.dto';
import { UpdateSupplierDto } from '../../../application/dtos/partners/update-supplier.dto';
import { SupplierMapper } from '../../../application/mappers/supplier.mapper';

@Controller('suppliers')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class SupplierController {
    constructor(
        @Inject(ISupplierServiceKey)
        private readonly supplierService: ISupplierService
    ) {}

    @Post('import')
    @RequirePermissions(PermissionCode.SUPPLIER_CREATE)
    @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
    async importSuppliers(@UploadedFile() file: any, @Inject(ExcelService) excelService: ExcelService) {
        if (!file) throw new HttpException('File không hợp lệ', HttpStatus.BAD_REQUEST);
        const data = await excelService.parseExcel(file.buffer);
        let count = 0;
        for (const row of data) {
            try {
                await this.supplierService.createSupplier(
                    row['Tên nhà cung cấp'] || row['name'] || 'New Supplier',
                    row['Người liên hệ'] || row['contactPerson'] || '',
                    row['Số điện thoại'] || row['phone'] || '',
                    row['Email'] || row['email'] || '',
                    row['Địa chỉ'] || row['address'] || ''
                );
                count++;
            } catch (e) {
                console.error('Import error for row:', row, e);
            }
        }
        return { message: `Đã nhập thành công ${count} nhà cung cấp.` };
    }

    @Post()
    @RequirePermissions(PermissionCode.SUPPLIER_CREATE)
    async create(@Body() dto: CreateSupplierDto) {
        const supplier = await this.supplierService.createSupplier(
            dto.name,
            dto.contactPerson,
            dto.phone,
            dto.email,
            dto.address
        );
        return SupplierMapper.toResponse(supplier);
    }

    @Get()
    @RequirePermissions(PermissionCode.SUPPLIER_VIEW)
    async findAll(
        @Query('search') search?: string, 
        @Query('status') status?: string,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
    ) {
        const paginatedSuppliers = await this.supplierService.getAllSuppliers(search, status, {
            page: parseInt(page),
            limit: parseInt(limit)
        });
        return {
            items: paginatedSuppliers.items.map(s => SupplierMapper.toResponse(s)),
            meta: paginatedSuppliers.meta
        };
    }

    @Get(':id')
    @RequirePermissions(PermissionCode.SUPPLIER_VIEW)
    async findOne(@Param('id') id: string) {
        const supplier = await this.supplierService.getSupplierById(id);
        if (!supplier) throw new NotFoundException('Supplier not found');
        return SupplierMapper.toResponse(supplier);
    }

    @Put(':id')
    @RequirePermissions(PermissionCode.SUPPLIER_UPDATE)
    async update(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
        const updateData: any = {
            name: dto.name,
            contactPerson: dto.contactPerson,
            phone: dto.phone,
            email: dto.email,
            address: dto.address,
            status: dto.status
        };
        const supplier = await this.supplierService.updateSupplier(id, updateData);
        return SupplierMapper.toResponse(supplier);
    }

    @Delete(':id')
    @RequirePermissions(PermissionCode.SUPPLIER_DELETE)
    async remove(@Param('id') id: string) {
        return await this.supplierService.deleteSupplier(id);
    }
}
