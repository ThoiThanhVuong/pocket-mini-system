import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// ORM Entities
import { Product } from '../../infrastructure/database/entities/warehouse/product.entity';
import { Category } from '../../infrastructure/database/entities/warehouse/category.entity';

// Category
import { CategoryController } from '../../presentation/controllers/category.controller';
import { CategoryService } from '../../application/use-cases/category.service';
import { CategoryRepository } from '../../infrastructure/database/repositories/category.repository';
import { ICategoryServiceKey } from '../../core/interfaces/services/category.service.interface';

// Product
import { ProductController } from '../../presentation/controllers/product.controller';
import { ProductService } from '../../application/use-cases/product.service';
import { ProductRepository } from '../../infrastructure/database/repositories/product.repository';
import { IProductServiceKey } from '../../core/interfaces/services/product.service.interface';

// Cross-module
import { InventoryModule } from '../inventory/inventory.module';
import { SystemModule } from '../system/system.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category]),
    forwardRef(() => InventoryModule),
    SystemModule,
  ],
  controllers: [
    CategoryController,
    ProductController,
  ],
  providers: [
    // ── Category ─────────────────────────────────
    {
      provide: ICategoryServiceKey,
      useClass: CategoryService,
    },
    {
      provide: 'ICategoryRepository',
      useClass: CategoryRepository,
    },

    // ── Product ──────────────────────────────────
    {
      provide: IProductServiceKey,
      useClass: ProductService,
    },
    {
      provide: 'IProductRepository',
      useClass: ProductRepository,
    },
  ],
  exports: [
    'IProductRepository',
  ],
})
export class CatalogModule {}
