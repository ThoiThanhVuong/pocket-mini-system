import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../../infrastructure/database/entities/system/auditLog.entity';
import { Note } from '../../infrastructure/database/entities/system/note.entity';

import { SystemConfig } from '../../infrastructure/database/entities/system-config.entity';
import { SystemConfigService } from './services/system-config.service';

// Controllers
import { SystemConfigController } from './controllers/system-config.controller';
import { UploadController } from './controllers/upload.controller';
import { DashboardController } from '../../presentation/controllers/dashboard.controller';
import { ReportController } from '../../presentation/controllers/report.controller';
import { AuditLogController } from '../../presentation/controllers/audit.controller';
import { NoteController } from '../../presentation/controllers/note.controller';

// Services (application layer)
import { DashboardService } from '../../application/use-cases/dashboard.service';
import { ReportService } from '../../application/use-cases/report.service';

import { DashboardRepository } from '../../infrastructure/database/repositories/dashboard.repository';
import { ReportRepository } from '../../infrastructure/database/repositories/report.repository';
import { AuditLogRepository } from '../../infrastructure/database/repositories/audit-log.repository';
import { NoteRepository } from '../../infrastructure/database/repositories/note.repository';

// Services (application layer - continued)
import { AuditService } from '../../application/use-cases/audit.service';
import { NoteService } from '../../application/use-cases/note.service';

import { IDashboardRepositoryKey } from '../../core/interfaces/repositories/dashboard.repository.interface';
import { IReportRepositoryKey } from '../../core/interfaces/repositories/report.repository.interface';
import { IAuditLogRepositoryKey } from '../../core/interfaces/repositories/audit-log.repository.interface';
import { INoteRepositoryKey } from '../../core/interfaces/repositories/note.repository.interface';

// Tokens (services)
import { IDashboardServiceKey } from '../../core/interfaces/services/dashboard.service.interface';
import { IReportServiceKey } from '../../core/interfaces/services/report.service.interface';
import { IAuditServiceKey } from '../../core/interfaces/services/audit.service.interface';
import { INoteServiceKey } from '../../core/interfaces/services/note.service.interface';
import { ExcelService } from '../../application/use-cases/excel.service';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog, Note, SystemConfig])],
  controllers: [
    SystemConfigController, 
    UploadController, 
    DashboardController, 
    ReportController,
    AuditLogController,
    NoteController
  ],
  providers: [
    SystemConfigService,
    ExcelService,
    // Repositories
    { provide: IDashboardRepositoryKey, useClass: DashboardRepository },
    { provide: IReportRepositoryKey,    useClass: ReportRepository },
    { provide: IAuditLogRepositoryKey,  useClass: AuditLogRepository },
    { provide: INoteRepositoryKey,      useClass: NoteRepository },
    // Services
    { provide: IDashboardServiceKey,    useClass: DashboardService },
    { provide: IReportServiceKey,       useClass: ReportService },
    { provide: IAuditServiceKey,        useClass: AuditService },
    { provide: INoteServiceKey,         useClass: NoteService },
  ],
  exports: [SystemConfigService, IAuditServiceKey, INoteServiceKey, ExcelService],
})
export class SystemModule {}
