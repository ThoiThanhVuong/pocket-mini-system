import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal server error';

    // Extract string message — getResponse() có thể trả về string hoặc object
    let message: string;
    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const resp = exceptionResponse as any;
      if (Array.isArray(resp.message)) {
        message = resp.message.join(', ');
      } else {
        message = resp.message || resp.error || 'Đã xảy ra lỗi';
      }
    } else {
      message = 'Đã xảy ra lỗi';
    }

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(`Exception: ${message}`, (exception as any).stack);
    } else {
        this.logger.warn(`Exception: ${message}`);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message: message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
