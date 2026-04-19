import {
    Controller, Post, Get, Put, Delete,
    Body, Param, Query, Inject, UseGuards, NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ICategoryServiceKey } from '../../../core/interfaces/services/inventory/category.service.interface';
import type { ICategoryService } from '../../../core/interfaces/services/inventory/category.service.interface';
import { CreateCategoryDto } from '../../../application/dtos/catalog/create-category.dto';
import { UpdateCategoryDto } from '../../../application/dtos/catalog/update-category.dto';
import { CategoryMapper } from '../../../application/mappers/category.mapper';
import { PermissionsGuard } from '../../../infrastructure/auth/guards/permissions.guard';
import { RequirePermissions } from '../../../infrastructure/auth/decorators/require-permissions.decorator';
import { PermissionCode } from '../../../core/domain/enums/permission-code.enum';

@Controller('categories')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class CategoryController {
    constructor(
        @Inject(ICategoryServiceKey)
        private readonly categoryService: ICategoryService,
    ) {}

    // POST /categories
    @Post()
    @RequirePermissions(PermissionCode.CATEGORY_CREATE)
    async create(@Body() dto: CreateCategoryDto) {
        const category = await this.categoryService.createCategory(
            dto.name,
            dto.description,
            dto.image,
            dto.parentId,
        );
        return CategoryMapper.toResponse(category);
    }

    // GET /categories?search=...
    @Get()
    @RequirePermissions(PermissionCode.CATEGORY_VIEW)
    async findAll(
        @Query('search') search?: string,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
    ) {
        const paginatedCategories = await this.categoryService.getAllCategories(search, {
            page: parseInt(page),
            limit: parseInt(limit)
        });
        return {
            items: paginatedCategories.items.map(c => CategoryMapper.toResponse(c)),
            meta: paginatedCategories.meta
        };
    }

    // GET /categories/:id
    @Get(':id')
    @RequirePermissions(PermissionCode.CATEGORY_VIEW)
    async findOne(@Param('id') id: string) {
        const category = await this.categoryService.getCategoryById(id);
        if (!category) throw new NotFoundException('Không tìm thấy danh mục');
        return CategoryMapper.toResponse(category);
    }

    // GET /categories/:id/children
    @Get(':id/children')
    @RequirePermissions(PermissionCode.CATEGORY_VIEW)
    async getChildren(@Param('id') id: string) {
        const children = await this.categoryService.getChildren(id);
        return children.map(c => CategoryMapper.toResponse(c));
    }

    // PUT /categories/:id
    @Put(':id')
    @RequirePermissions(PermissionCode.CATEGORY_UPDATE)
    async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
        const category = await this.categoryService.updateCategory(
            id,
            dto.name,
            dto.description,
            dto.image,
            dto.parentId,
        );
        return CategoryMapper.toResponse(category);
    }

    // DELETE /categories/:id
    @Delete(':id')
    @RequirePermissions(PermissionCode.CATEGORY_DELETE)
    async remove(@Param('id') id: string) {
        await this.categoryService.deleteCategory(id);
        return { message: 'Xóa danh mục thành công' };
    }
}
