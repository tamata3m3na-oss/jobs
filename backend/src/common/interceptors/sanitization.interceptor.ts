import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SanitizationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data: unknown) => {
        if (!data) return data;

        // If it's an array of items
        if (Array.isArray(data)) {
          return data.map((item) => this.sanitizeItem(item));
        }

        // If it's a single item
        return this.sanitizeItem(data as Record<string, unknown>);
      })
    );
  }

  private sanitizeItem(item: Record<string, unknown>) {
    // Check if it's an application and has a job with blindHiring enabled
    const job = item.job as Record<string, unknown> | undefined;
    const matchSettings = job?.matchSettings as Record<string, unknown> | undefined;

    if (matchSettings?.blindHiring) {
      const applicant = item.applicant as Record<string, unknown> | undefined;
      if (applicant) {
        return {
          ...item,
          applicant: {
            id: applicant.id,
            // Redact personal info
            firstName: 'Candidate',
            lastName: (applicant.id as string)?.substring(0, 8),
            email: 'redacted@example.com',
            phone: 'REDACTED',
            avatarUrl: null,
            // Keep professional info
            profile: applicant.profile,
          },
        };
      }
    }
    return item;
  }
}
