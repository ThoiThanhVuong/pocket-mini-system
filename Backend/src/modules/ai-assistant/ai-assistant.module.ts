import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiAssistantController } from '../../presentation/controllers/ai/ai-assistant.controller';
import { AiAssistantService } from '../../application/use-cases/ai/ai-assistant.service';
import { OpenRouterAiProvider } from '../../infrastructure/external-services/ai/openrouter-ai.provider';
import { IAiProviderKey } from '../../core/interfaces/providers/ai-provider.interface';
import { IAiAssistantServiceKey } from '../../core/interfaces/services/ai/ai-assistant.service.interface';
import { InventoryModule } from '../inventory/inventory.module';
import { CatalogModule } from '../catalog/catalog.module';
import { PartnersModule } from '../partners/partners.module';
import { ChatThreadEntity } from '../../infrastructure/database/entities/ai/chat-thread.entity';
import { ChatMessageEntity } from '../../infrastructure/database/entities/ai/chat-message.entity';
import { AiModelEntity } from '../../infrastructure/database/entities/ai/ai-model.entity';
import { ChatRepository } from '../../infrastructure/database/repositories/ai/chat.repository';
import { SystemModule } from '../system/system.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { PayrollModule } from '../payroll/payroll.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatThreadEntity, ChatMessageEntity, AiModelEntity]),
    InventoryModule,
    CatalogModule,
    PartnersModule,
    SystemModule,
    AttendanceModule,
    PayrollModule,
  ],
  controllers: [AiAssistantController],
  providers: [
    {
      provide: IAiProviderKey,
      useClass: OpenRouterAiProvider,
    },
    {
      provide: IAiAssistantServiceKey,
      useClass: AiAssistantService,
    },
    {
      provide: 'IChatRepository',
      useClass: ChatRepository,
    },
  ],
})
export class AiAssistantModule {}
