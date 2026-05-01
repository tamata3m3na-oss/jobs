import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // Skip CSRF check for safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return true;
    }

    const csrfToken = request.headers['x-csrf-token'];
    const csrfCookie = request.cookies['XSRF-TOKEN'];

    if (!csrfToken || !csrfCookie || csrfToken !== csrfCookie) {
      throw new ForbiddenException('Invalid or missing CSRF token');
    }

    return true;
  }
}
