import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';

const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_COOKIE_NAME = 'csrf_token';

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    if (request.method === 'GET' || request.method === 'HEAD' || request.method === 'OPTIONS') {
      return true;
    }

    const csrfTokenFromHeader = request.headers[CSRF_HEADER_NAME] as string | undefined;
    const csrfTokenFromCookie = request.cookies?.[CSRF_COOKIE_NAME] as string | undefined;

    if (!csrfTokenFromCookie) {
      throw new BadRequestException('CSRF token cookie missing');
    }

    if (!csrfTokenFromHeader) {
      throw new BadRequestException('CSRF token header missing');
    }

    if (csrfTokenFromHeader !== csrfTokenFromCookie) {
      throw new BadRequestException('Invalid CSRF token');
    }

    return true;
  }
}
