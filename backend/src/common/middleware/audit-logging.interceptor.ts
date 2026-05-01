import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../logger/logger.service';
import { AuditService } from '../../modules/audit/audit.service';

@Injectable()
export class AuditLoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: LoggerService,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user, ip } = request;
    const userAgent = request.get('user-agent') || '';

    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

    return next.handle().pipe(
      tap(async (data) => {
        if (isMutation) {
          this.logger.log(`Audit: ${method} ${url}`, {
            context: 'AUDIT',
            action: method,
            resource: url,
            payload: body,
            response: data,
            userId: user?.id,
            ip,
            userAgent,
          });

          try {
            await this.auditService.log({
              entityType: url.split('/')[2] || 'unknown',
              entityId: data?.id || 'unknown',
              action: method,
              userId: user?.id,
              userEmail: user?.email,
              changes: body,
              metadata: { url, statusCode: context.switchToHttp().getResponse().statusCode },
              ipAddress: ip,
              userAgent,
            });
          } catch (error) {
            this.logger.error('Failed to save audit log', error.stack);
          }
        }
      }),
    );
  }
}
