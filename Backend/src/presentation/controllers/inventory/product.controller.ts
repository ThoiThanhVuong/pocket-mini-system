import { ILike } from 'typeorm';
import {
    Controller, Post, Get, Put, Delete, Patch,
    Body, Param, Query, Inject, UseGuards, NotFoundException, Req, Res,
    UseInterceptors, UploadedFile, HttpException, HttpStatus
} from '@nestjs/common';
import { Response } from 'express';
import type { Response as ExpressResponse } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ExcelService } from '../../../application/use-cases/system/excel.service';
import { AuthGuard } from '@nestjs/passport';
import { IProductServiceKey } from '../../../core/interfaces/services/inventory/product.service.interface';
import type { IProductService } from '../../../core/interfaces/services/inventory/product.service.interface';
import type { IStockRepository } from '../../../core/interfaces/repositories/inventory/stock.repository.interface';
import type { ICategoryRepository } from '../../../core/interfaces/repositories/inventory/category.repository.interface';
import { ICategoryServiceKey } from '../../../core/interfaces/services/inventory/category.service.interface';
import type { ICategoryService } from '../../../core/interfaces/services/inventory/category.service.interface';
import { CreateProductDto } from '../../../application/dtos/catalog/create-product.dto';
import { UpdateProductDto } from '../../../application/dtos/catalog/update-product.dto';
import { ProductMapper } from '../../../application/mappers/product.mapper';
import { PermissionsGuard } from '../../../infrastructure/auth/guards/permissions.guard';
import { RequirePermissions } from '../../../infrastructure/auth/decorators/require-permissions.decorator';
import { PermissionCode } from '../../../core/domain/enums/permission-code.enum';

@Controller('products')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ProductController {
    constructor(
        @Inject(IProductServiceKey)
        private readonly productService: IProductService,
        @Inject('IStockRepository')
        private readonly stockRepo: IStockRepository,
        @Inject('ICategoryRepository')
        private readonly categoryRepo: ICategoryRepository,
        @Inject(ICategoryServiceKey)
        private readonly categoryService: ICategoryService,
        @Inject(ExcelService)
        private readonly excelService: ExcelService,
    ) {}

    // POST /products/import
    @Post('import')
    @RequirePermissions(PermissionCode.PRODUCT_CREATE)
    @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
    async importProducts(@UploadedFile() file: any) {
        if (!file) throw new HttpException('File không hợp lệ', HttpStatus.BAD_REQUEST);
        const data = await this.excelService.parseExcel(file.buffer);
        console.log(`[Import] Bắt đầu xử lý ${data.length} hàng dữ liệu (Chế độ Upsert).`);
        
        let createdCount = 0;
        let updatedCount = 0;
        let errorCount = 0;
        let rowIndex = 0;
        const categoryCache = new Map<string, string>();

        for (const row of data) {
            rowIndex++;
            try {
                const skuValue = row['Mã SKU'] || row['sku'];
                const sku = skuValue ? skuValue.toString().trim() : `SKU-${Date.now()}-${rowIndex}`;
                
                // Tiền xử lý Danh mục
                const categoryInput = (row['Mã danh mục'] || row['categoryId'] || '').toString().trim();
                let categoryId: string | null = null;

                if (categoryInput) {
                    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryInput);
                    if (isUuid) {
                        categoryId = categoryInput;
                    } else {
                        const lowerName = categoryInput.toLowerCase();
                        if (categoryCache.has(lowerName)) {
                            categoryId = categoryCache.get(lowerName)!;
                        } else {
                            const category = await this.categoryRepo.findByCondition({ name: ILike(categoryInput) });
                            if (category) {
                                categoryId = category.id;
                                categoryCache.set(lowerName, categoryId);
                            } else {
                                console.log(`[Import] Tạo mới danh mục: "${categoryInput}"`);
                                const newCategory = await this.categoryService.createCategory(categoryInput);
                                categoryId = newCategory.id;
                                categoryCache.set(lowerName, categoryId);
                            }
                        }
                    }
                }

                // Kiểm tra xem sản phẩm đã tồn tại chưa
                const existingProduct = await (this.productService as any).productRepo.findBySku(sku);
                
                if (existingProduct) {
                    // Cập nhật sản phẩm cũ
                    await this.productService.updateProduct(existingProduct.id, {
                        name: (row['Tên sản phẩm'] || row['name'] || existingProduct.name).toString().trim(),
                        price: Number(row['Giá'] || row['price'] || existingProduct.price),
                        description: (row['Mô tả'] || row['description'] || existingProduct.description).toString().trim(),
                        categoryId: categoryId || existingProduct.categoryId,
                        unit: (row['Đơn vị'] || row['unit'] || existingProduct.unit).toString().trim(),
                        minStockLevel: Number(row['Tồn kho tối thiểu'] || row['minStockLevel'] || existingProduct.minStockLevel)
                    });
                    updatedCount++;
                } else {
                    // Tạo sản phẩm mới
                    await this.productService.createProduct(
                        (row['Tên sản phẩm'] || row['name'] || 'Sản phẩm mới').toString().trim(),
                        sku,
                        Number(row['Giá'] || row['price'] || 0),
                        (row['Mô tả'] || row['description'] || '').toString().trim(),
                        '', // image
                        categoryId || '', 
                        (row['Đơn vị'] || row['unit'] || 'Cái').toString().trim(),
                        Number(row['Tồn kho tối thiểu'] || row['minStockLevel'] || 0)
                    );
                    createdCount++;
                }
            } catch (e: any) {
                console.error(`[Import Error] Hàng ${rowIndex}:`, e.message || e);
                errorCount++;
            }
        }
        return { 
            message: `Nhập dữ liệu hoàn tất: Tạo mới ${createdCount}, Cập nhật ${updatedCount}, Lỗi ${errorCount} sản phẩm.` 
        };
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
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
    ) {
        // Query param luôn là string → convert sang boolean nếu có
        const isActiveBool = isActive !== undefined
            ? isActive === 'true'
            : undefined;

        const paginatedProducts = await this.productService.getAllProducts(search, isActiveBool, categoryId, {
            page: parseInt(page),
            limit: parseInt(limit)
        });

        const roleCodes = (req.user.roles || []).map((r: any) => (r.roleCode as string)?.toLowerCase());
        const isSystemAdmin = roleCodes.some(r => r === 'admin' || r === 'system_admin' || r?.includes('admin'));
        const userWarehouseIds = req.user.warehouseIds || [];

        const dtoItems = await Promise.all(paginatedProducts.items.map(async p => {
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

        return {
            items: dtoItems,
            meta: paginatedProducts.meta
        };
    }

    // GET /products/import-template
    @Get('import-template')
    @RequirePermissions(PermissionCode.PRODUCT_CREATE)
    async getImportTemplate(@Res() res: ExpressResponse) {
        const headers = [
            'Tên sản phẩm', 
            'Mã SKU', 
            'Giá', 
            'Mô tả', 
            'Mã danh mục', 
            'Đơn vị', 
            'Tồn kho tối thiểu'
        ];
        const buffer = await this.excelService.generateTemplate('Mẫu nhập sản phẩm', headers);
        
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="Mau-nhap-san-pham.xlsx"',
        });
        res.send(buffer);
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
