import { Controller, Post, Get, Delete, Body, Req, UseGuards, Inject, Query, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IAiAssistantServiceKey } from '../../../core/interfaces/services/ai/ai-assistant.service.interface';
import type { IAiAssistantService } from '../../../core/interfaces/services/ai/ai-assistant.service.interface';

@Controller('ai-assistant')
@UseGuards(AuthGuard('jwt'))
export class AiAssistantController {
  constructor(
    @Inject(IAiAssistantServiceKey) private readonly aiAssistantService: IAiAssistantService,
  ) {}

  @Post('chat')
  async chat(@Body('message') message: string, @Body('threadId') threadId: string, @Req() req: any) {
    const userId = req.user?.id || (req.user as any)?._id || 'test-user-id';
    return await this.aiAssistantService.handleChat(userId, message, threadId);
  }

  @Get('history')
  async getHistory(@Query('threadId') threadId: string, @Req() req: any) {
    const userId = req.user?.id || (req.user as any)?._id || 'test-user-id';
    return await this.aiAssistantService.getChatHistory(userId, threadId);
  }

  @Get('threads')
  async getThreads(@Req() req: any) {
    const userId = req.user?.id || (req.user as any)?._id || 'test-user-id';
    return await this.aiAssistantService.getUserThreads(userId);
  }

  @Delete('threads/:threadId')
  async deleteThread(@Param('threadId') threadId: string, @Req() req: any) {
    const userId = req.user?.id || (req.user as any)?._id || 'test-user-id';
    await this.aiAssistantService.deleteThread(userId, threadId);
    return { success: true, message: 'Đã xóa đoạn chat' };
  }
}
