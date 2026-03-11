import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../../../shared/dtos/api-response.dto';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map(data => {
            // Avoid double wrapping if data is already ApiResponse
            if (data instanceof ApiResponse) {
                return data;
            }
            return new ApiResponse(true, 'Request successful', data);
        })
    );
  }
}
