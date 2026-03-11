import {
    Controller, Post, Get, Put, Delete, Patch,
    Body, Param, Query, Inject, UseGuards, NotFoundException, Req,
    UseInterceptors, UploadedFile, HttpException, HttpStatus
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ExcelService } from '../../application/use-cases/excel.service';
import { AuthGuard } from '@nestjs/passport';
import { IProductServiceKey } from '../../core/interfaces/services/product.service.interface';
import type { IProductService } from '../../core/interfaces/services/product.service.interface';
import type { IStockRepository } from '../../core/interfaces/repositories/stock.repository.interface';
import { CreateProductDto } from '../../application/dtos/catalog/create-product.dto';
import { UpdateProductDto } from '../../application/dtos/catalog/update-product.dto';
import { ProductMapper } from '../../application/mappers/product.mapper';
import { PermissionsGuard } from '../../infrastructure/auth/guards/permissions.guard';
import { RequirePermissions } from '../../infrastructure/auth/decorators/require-permissions.decorator';
import { PermissionCode } from '../../core/domain/enums/permission-code.enum';

@Controller('products')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ProductController {
    constructor(
        @Inject(IProductServiceKey)
        private readonly productService: IProductService,
        @Inject('IStockRepository')
        private readonly stockRepo: IStockRepository,
    ) {}

    // POST /products/import
    @Post('import')
    @RequirePermissions(PermissionCode.PRODUCT_CREATE)
    @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
    async importProducts(@UploadedFile() file: any, @Inject(ExcelService) excelService: ExcelService) {
        if (!file) throw new HttpException('File không hợp lệ', HttpStatus.BAD_REQUEST);
        const data = await excelService.parseExcel(file.buffer);
        let count = 0;
        for (const row of data) {
            try {
                await this.productService.createProduct(
                    row['Tên sản phẩm'] || row['name'] || 'New Product',
                    row['Mã SKU'] || row['sku'] || `SKU-${Date.now()}-${count}`,
                    Number(row['Giá'] || row['price'] || 0),
                    row['Mô tả'] || row['description'] || '',
                    '', // image
                    row['Mã danh mục'] || row['categoryId'] || '', 
                    row['Đơn vị'] || row['unit'] || 'Cái',
                    Number(row['Tồn kho tối thiểu'] || row['minStockLevel'] || 0)
                );
                count++;
            } catch (e) {
                console.error('Import error for row:', row, e);
            }
        }
        return { message: `Đã nhập thành công ${count} sản phẩm.` };
    }

    // POST /products
    @Post()
    @RequirePermissions(PermissionCode.PRODUCT_CREATE)
    async create(@Body() dto: CreateProductDto) {
        const product = await this.productService.createProduct(
            dto.name,
            dto.sku,
            dto.price,
            dto.description ?? '',
            dto.image ?? '',
            dto.categoryId ?? '',
            dto.unit,
            dto.minStockLevel ?? 0,
        );
        return ProductMapper.toResponse(product);
    }

    // GET /products?search=&isActive=&categoryId=
    @Get()
    @RequirePermissions(PermissionCode.PRODUCT_VIEW)
    async findAll(
        @Req() req: any,
        @Query('search') search?: string,
        @Query('isActive') isActive?: string,
        @Query('categoryId') categoryId?: string,
    ) {
        // Query param luôn là string → convert sang boolean nếu có
        const isActiveBool = isActive !== undefined
            ? isActive === 'true'
            : undefined;

        const products = await this.productService.getAllProducts(search, isActiveBool, categoryId);

        const roleCodes = (req.user.roles || []).map((r: any) => (r.roleCode as string)?.toLowerCase());
        const isSystemAdmin = roleCodes.some(r => r === 'admin' || r === 'system_admin' || r?.includes('admin'));
        const userWarehouseIds = req.user.warehouseIds || [];

        return await Promise.all(products.map(async p => {
            const dto = ProductMapper.toResponse(p);
            if (!isSystemAdmin) {
                if (userWarehouseIds.length === 0) {
                    dto.stockQuantity = 0;
                } else {
                    const stocks = await this.stockRepo.findByProduct(p.id);
                    dto.stockQuantity = stocks
                        .filter(s => userWarehouseIds.includes(s.warehouseId))
                        .reduce((sum, s) => sum + Number(s.quantity), 0);
                }
            }
            return dto;
        }));
    }

    // GET /products/:id
    @Get(':id')
    @RequirePermissions(PermissionCode.PRODUCT_VIEW)
    async findOne(@Param('id') id: string) {
        const product = await this.productService.getProductById(id);
        if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
        return ProductMapper.toResponse(product);
    }

    // PUT /products/:id
    @Put(':id')
    @RequirePermissions(PermissionCode.PRODUCT_UPDATE)
    async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
        const product = await this.productService.updateProduct(id, dto);
        return ProductMapper.toResponse(product);
    }

    // PATCH /products/:id/price  — chỉ update giá
    @Patch(':id/price')
    @RequirePermissions(PermissionCode.PRODUCT_UPDATE)
    async updatePrice(
        @Param('id') id: string,
        @Body('price') price: number,
    ) {
        const product = await this.productService.updatePrice(id, price);
        return ProductMapper.toResponse(product);
    }

    // PATCH /products/:id/stock  — chỉ update mức tồn kho tối thiểu
    @Patch(':id/stock')
    @RequirePermissions(PermissionCode.PRODUCT_UPDATE)
    async updateStock(
        @Param('id') id: string,
        @Body('minStockLevel') minStockLevel: number,
    ) {
        const product = await this.productService.updateStock(id, minStockLevel);
        return ProductMapper.toResponse(product);
    }

    // DELETE /products/:id
    @Delete(':id')
    @RequirePermissions(PermissionCode.PRODUCT_DELETE)
    async remove(@Param('id') id: string) {
        await this.productService.deleteProduct(id);
        return { message: 'Xóa sản phẩm thành công' };
    }
}
