import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// ── Modules ─────────────────────────────────────────────────────────
import { FinanceModule } from '../finance/finance.module';
import { SystemModule } from '../system/system.module';

// ── ORM Entities ────────────────────────────────────────────────────
import { Warehouse } from '../../infrastructure/database/entities/warehouse/warehouse.entity';
import { Stock } from '../../infrastructure/database/entities/warehouse/stock.entity';
import { StockIn } from '../../infrastructure/database/entities/warehouse/stock-in.entity';
import { StockInItem } from '../../infrastructure/database/entities/warehouse/stock-in-item.entity';
import { StockOut } from '../../infrastructure/database/entities/warehouse/stock-out.entity';
import { StockOutItem } from '../../infrastructure/database/entities/warehouse/stock-out-item.entity';
import { StockTransfer } from '../../infrastructure/database/entities/warehouse/stock-transfer.entity';
import { StockTransferItem } from '../../infrastructure/database/entities/warehouse/stock-transfer-item.entity';

// ── Repositories ────────────────────────────────────────────────────
import { WarehouseRepository } from '../../infrastructure/database/repositories/inventory/warehouse.repository';
import { StockRepository } from '../../infrastructure/database/repositories/inventory/stock.repository';
import { StockInRepository } from '../../infrastructure/database/repositories/inventory/stock-in.repository';
import { StockOutRepository } from '../../infrastructure/database/repositories/inventory/stock-out.repository';
import { StockTransferRepository } from '../../infrastructure/database/repositories/inventory/stock-transfer.repository';

// ── Services ────────────────────────────────────────────────────────
import { WarehouseService, IWarehouseRepositoryKey } from '../../application/use-cases/inventory/warehouse.service';
import { StockService, IStockRepositoryKey } from '../../application/use-cases/inventory/stock.service';
import { StockInService, IStockInRepositoryKey } from '../../application/use-cases/inventory/stock-in.service';
import { StockOutService, IStockOutRepositoryKey } from '../../application/use-cases/inventory/stock-out.service';
import { StockTransferService, IStockTransferRepositoryKey } from '../../application/use-cases/inventory/stock-transfer.service';
import { TransactionService } from '../../application/use-cases/finance/transaction.service';

// ── Service interfaces (token keys) ────────────────────────────────
import { IWarehouseServiceKey } from '../../core/interfaces/services/inventory/warehouse.service.interface';
import { IStockServiceKey } from '../../core/interfaces/services/inventory/stock.service.interface';
import { IStockInServiceKey } from '../../core/interfaces/services/inventory/stock-in.service.interface';
import { IStockOutServiceKey } from '../../core/interfaces/services/inventory/stock-out.service.interface';
import { IStockTransferServiceKey } from '../../core/interfaces/services/inventory/stock-transfer.service.interface';
import { ITransactionServiceKey } from '../../core/interfaces/services/finance/transaction.service.interface';

// ── Controllers ─────────────────────────────────────────────────────
import { WarehouseController } from '../../presentation/controllers/inventory/warehouse.controller';
import { StockController } from '../../presentation/controllers/inventory/stock.controller';
import { StockInController } from '../../presentation/controllers/inventory/stock-in.controller';
import { StockOutController } from '../../presentation/controllers/inventory/stock-out.controller';
import { StockTransferController } from '../../presentation/controllers/inventory/stock-transfer.controller';
import { TransactionController } from '../../presentation/controllers/finance/transaction.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Warehouse,
      Stock,
      StockIn,
      StockInItem,
      StockOut,
      StockOutItem,
      StockTransfer,
      StockTransferItem,
    ]),
    FinanceModule,
    SystemModule,
  ],
  controllers: [
    WarehouseController,
    StockController,
    StockInController,
    StockOutController,
    StockTransferController,
    TransactionController,
  ],
  providers: [
    // ── Repositories ──────────────────────────────────────────────
    { provide: IWarehouseRepositoryKey,      useClass: WarehouseRepository },
    { provide: 'IStockRepository',           useClass: StockRepository },
    { provide: IStockInRepositoryKey,        useClass: StockInRepository },
    { provide: IStockOutRepositoryKey,       useClass: StockOutRepository },
    { provide: IStockTransferRepositoryKey,  useClass: StockTransferRepository },

    // ── Services ──────────────────────────────────────────────────
    { provide: IWarehouseServiceKey,      useClass: WarehouseService },
    { provide: IStockServiceKey,          useClass: StockService },
    { provide: IStockInServiceKey,        useClass: StockInService },
    { provide: IStockOutServiceKey,       useClass: StockOutService },
    { provide: IStockTransferServiceKey,  useClass: StockTransferService },
    { provide: ITransactionServiceKey,    useClass: TransactionService },
  ],
  exports: [
    IWarehouseServiceKey,
    IStockServiceKey,
    IStockInServiceKey,
    IStockOutServiceKey,
    IStockTransferServiceKey,
    ITransactionServiceKey,
    'IStockRepository',
    IWarehouseRepositoryKey,
    IStockInRepositoryKey,
    IStockOutRepositoryKey,
  ],
})
export class InventoryModule {}
