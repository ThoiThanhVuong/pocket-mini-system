import { Module } from '@nestjs/common';
import { AppConfigModule } from './infrastructure/config/config.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { IamModule } from './modules/iam/iam.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { PartnersModule } from './modules/partners/partners.module';
import { SystemModule } from './modules/system/system.module';
import { FinanceModule } from './modules/finance/finance.module';

import { AttendanceModule } from './modules/attendance/attendance.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { AiAssistantModule } from './modules/ai-assistant/ai-assistant.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    AppConfigModule, 
    DatabaseModule, 
    IamModule, 
    AttendanceModule, 
    PayrollModule, 
    CatalogModule, 
    InventoryModule, 
    PartnersModule, 
    SystemModule, 
    FinanceModule, 
    AiAssistantModule,
    ScheduleModule.forRoot()
  ],
})
export class AppModule {}
