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
import { WarehouseRepository } from '../../infrastructure/database/repositories/warehouse.repository';
import { StockRepository } from '../../infrastructure/database/repositories/stock.repository';
import { StockInRepository } from '../../infrastructure/database/repositories/stock-in.repository';
import { StockOutRepository } from '../../infrastructure/database/repositories/stock-out.repository';
import { StockTransferRepository } from '../../infrastructure/database/repositories/stock-transfer.repository';

// ── Services ────────────────────────────────────────────────────────
import { WarehouseService, IWarehouseRepositoryKey } from '../../application/use-cases/warehouse.service';
import { StockService, IStockRepositoryKey } from '../../application/use-cases/stock.service';
import { StockInService, IStockInRepositoryKey } from '../../application/use-cases/stock-in.service';
import { StockOutService, IStockOutRepositoryKey } from '../../application/use-cases/stock-out.service';
import { StockTransferService, IStockTransferRepositoryKey } from '../../application/use-cases/stock-transfer.service';
import { TransactionService } from '../../application/use-cases/transaction.service';

// ── Service interfaces (token keys) ────────────────────────────────
import { IWarehouseServiceKey } from '../../core/interfaces/services/warehouse.service.interface';
import { IStockServiceKey } from '../../core/interfaces/services/stock.service.interface';
import { IStockInServiceKey } from '../../core/interfaces/services/stock-in.service.interface';
import { IStockOutServiceKey } from '../../core/interfaces/services/stock-out.service.interface';
import { IStockTransferServiceKey } from '../../core/interfaces/services/stock-transfer.service.interface';
import { ITransactionServiceKey } from '../../core/interfaces/services/transaction.service.interface';

// ── Controllers ─────────────────────────────────────────────────────
import { WarehouseController } from '../../presentation/controllers/warehouse.controller';
import { StockController } from '../../presentation/controllers/stock.controller';
import { StockInController } from '../../presentation/controllers/stock-in.controller';
import { StockOutController } from '../../presentation/controllers/stock-out.controller';
import { StockTransferController } from '../../presentation/controllers/stock-transfer.controller';
import { TransactionController } from '../../presentation/controllers/transaction.controller';

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
  ],
})
export class InventoryModule {}
