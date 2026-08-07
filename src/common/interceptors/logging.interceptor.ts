import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { AuthUser } from '../types/auth-user.type';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest<Request & { user?: AuthUser }>();
    const res = httpContext.getResponse<Response>();

    const { method, originalUrl, url } = req;
    const path = originalUrl || url;
    const ip =
      req.ip ||
      (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      '-';
    const userAgent = req.headers['user-agent'] || '-';
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = res.statusCode;
          const userStr = req.user?.id ? ` - User: ${req.user.id}` : '';
          const logMessage = `${method} ${path} ${statusCode} +${duration}ms - IP: ${ip}${userStr} - UA: ${userAgent}`;

          if (statusCode >= 500) {
            this.logger.error(logMessage);
          } else if (statusCode >= 400) {
            this.logger.warn(logMessage);
          } else {
            this.logger.log(logMessage);
          }
        },
        error: (err: unknown) => {
          const duration = Date.now() - startTime;
          const statusCode =
            (err as { status?: number; statusCode?: number })?.status ||
            (err as { status?: number; statusCode?: number })?.statusCode ||
            res.statusCode ||
            500;
          const userStr = req.user?.id ? ` - User: ${req.user.id}` : '';
          const logMessage = `${method} ${path} ${statusCode} +${duration}ms - IP: ${ip}${userStr} - UA: ${userAgent}`;

          if (statusCode >= 500) {
            this.logger.error(logMessage);
          } else {
            this.logger.warn(logMessage);
          }
        },
      }),
    );
  }
}
