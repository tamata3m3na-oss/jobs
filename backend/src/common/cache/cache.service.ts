import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { createHash } from 'crypto';

export interface CacheOptions {
  ttl?: number;
  prefix?: string;
}

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly logger = new Logger(CacheService.name);

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get<string>('redis.host', 'localhost'),
      port: this.configService.get<number>('redis.port', 6379),
      retryStrategy: (times) => {
        if (times > 3) {
          this.logger.warn('Redis connection failed, caching disabled');
          return null;
        }
        return Math.min(times * 200, 2000);
      },
    });

    this.redis.on('error', (err) => {
      this.logger.warn(`Redis error: ${err.message}`);
    });

    this.redis.on('connect', () => {
      this.logger.log('Redis connected');
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }

  private getKey(key: string, prefix?: string): string {
    const prefixStr = prefix || 'cache';
    return `${prefixStr}:${key}`;
  }

  private hashKey(key: string): string {
    return createHash('sha256').update(key).digest('hex').substring(0, 16);
  }

  async get<T>(key: string, prefix?: string): Promise<T | null> {
    try {
      const fullKey = this.getKey(key, prefix);
      const data = await this.redis.get(fullKey);
      if (data) {
        return JSON.parse(data) as T;
      }
      return null;
    } catch (error) {
      this.logger.warn(`Cache get error: ${(error as Error).message}`);
      return null;
    }
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    try {
      const fullKey = this.getKey(key, options?.prefix);
      const ttl = options?.ttl || 300;
      await this.redis.setex(fullKey, ttl, JSON.stringify(value));
    } catch (error) {
      this.logger.warn(`Cache set error: ${(error as Error).message}`);
    }
  }

  async delete(key: string, prefix?: string): Promise<void> {
    try {
      const fullKey = this.getKey(key, prefix);
      await this.redis.del(fullKey);
    } catch (error) {
      this.logger.warn(`Cache delete error: ${(error as Error).message}`);
    }
  }

  async deletePattern(pattern: string, prefix?: string): Promise<void> {
    try {
      const fullPattern = this.getKey(pattern, prefix);
      const keys = await this.redis.keys(fullPattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      this.logger.warn(`Cache deletePattern error: ${(error as Error).message}`);
    }
  }

  async invalidateJobCache(jobId?: string): Promise<void> {
    if (jobId) {
      await this.delete(`job:${jobId}`, 'job');
    }
    await this.deletePattern('search:*', 'jobs');
    await this.deletePattern('featured', 'jobs');
  }

  generateSearchCacheKey(filters: Record<string, unknown>): string {
    const sortedFilters = JSON.stringify(filters, Object.keys(filters).sort());
    return this.hashKey(sortedFilters);
  }
}