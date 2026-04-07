import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../../infrastructure/database/entities/system/auditLog.entity';
import { Note } from '../../infrastructure/database/entities/system/note.entity';

import { SystemConfig } from '../../infrastructure/database/entities/system-config.entity';
import { SystemConfigService } from '../../application/use-cases/system/system-config.service';

// Controllers
import { SystemConfigController } from '../../presentation/controllers/system/system-config.controller';
import { UploadController } from '../../presentation/controllers/system/upload.controller';
import { DashboardController } from '../../presentation/controllers/system/dashboard.controller';
import { ReportController } from '../../presentation/controllers/system/report.controller';
import { AuditLogController } from '../../presentation/controllers/system/audit.controller';
import { NoteController } from '../../presentation/controllers/system/note.controller';

// Services (application layer)
import { DashboardService } from '../../application/use-cases/system/dashboard.service';
import { ReportService } from '../../application/use-cases/system/report.service';

import { DashboardRepository } from '../../infrastructure/database/repositories/system/dashboard.repository';
import { ReportRepository } from '../../infrastructure/database/repositories/system/report.repository';
import { AuditLogRepository } from '../../infrastructure/database/repositories/system/audit-log.repository';
import { NoteRepository } from '../../infrastructure/database/repositories/system/note.repository';

// Services (application layer - continued)
import { AuditService } from '../../application/use-cases/system/audit.service';
import { NoteService } from '../../application/use-cases/system/note.service';

import { IDashboardRepositoryKey } from '../../core/interfaces/repositories/system/dashboard.repository.interface';
import { IReportRepositoryKey } from '../../core/interfaces/repositories/system/report.repository.interface';
import { IAuditLogRepositoryKey } from '../../core/interfaces/repositories/system/audit-log.repository.interface';
import { INoteRepositoryKey } from '../../core/interfaces/repositories/system/note.repository.interface';

// Tokens (services)
import { IDashboardServiceKey } from '../../core/interfaces/services/system/dashboard.service.interface';
import { IReportServiceKey } from '../../core/interfaces/services/system/report.service.interface';
import { IAuditServiceKey } from '../../core/interfaces/services/system/audit.service.interface';
import { INoteServiceKey } from '../../core/interfaces/services/system/note.service.interface';
import { ExcelService } from '../../application/use-cases/system/excel.service';

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
  exports: [SystemConfigService, IAuditServiceKey, INoteServiceKey, ExcelService, IReportServiceKey],
})
export class SystemModule {}
