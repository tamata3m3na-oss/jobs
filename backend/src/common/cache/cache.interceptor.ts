import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { CacheService } from './cache.service';
import { CACHE_TTL_METADATA, CACHE_PREFIX_METADATA, CACHE_KEY_METADATA } from './cache.decorator';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest();
    const cacheKey = this.buildCacheKey(request);

    const cachedValue = await this.cacheService.get(cacheKey);
    if (cachedValue !== null) {
      return of(cachedValue);
    }

    return next.handle().pipe(
      tap(async (data) => {
        const ttl = this.reflector.get<number>(CACHE_TTL_METADATA, context.getHandler());
        const prefix = this.reflector.get<string>(CACHE_PREFIX_METADATA, context.getHandler());

        if (data !== undefined && data !== null) {
          await this.cacheService.set(cacheKey, data, {
            ttl: ttl || 300,
            prefix: prefix || 'cache',
          });
        }
      })
    );
  }

  private buildCacheKey(request: {
    method: string;
    path: string;
    query: Record<string, unknown>;
  }): string {
    const { method, path, query } = request;
    const queryString = Object.keys(query)
      .sort()
      .map((k) => `${k}=${JSON.stringify(query[k])}`)
      .join('&');
    return `${method}:${path}${queryString ? `?${queryString}` : ''}`;
  }
}
