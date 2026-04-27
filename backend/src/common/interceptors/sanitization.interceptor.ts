import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SanitizationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (!data) return data;

        // If it's an array of applications
        if (Array.isArray(data)) {
          return data.map((item) => this.sanitizeItem(item));
        }

        // If it's a single application
        return this.sanitizeItem(data);
      }),
    );
  }

  private sanitizeItem(item: any) {
    // Check if it's an application and has a job with blindHiring enabled
    if (item.job && item.job.matchSettings && item.job.matchSettings.blindHiring) {
      if (item.applicant) {
        return {
          ...item,
          applicant: {
            id: item.applicant.id,
            // Redact personal info
            firstName: 'Candidate',
            lastName: item.applicant.id.substring(0, 8),
            email: 'redacted@example.com',
            phone: 'REDACTED',
            avatarUrl: null,
            // Keep professional info
            profile: item.applicant.profile,
          },
        };
      }
    }
    return item;
  }
}
