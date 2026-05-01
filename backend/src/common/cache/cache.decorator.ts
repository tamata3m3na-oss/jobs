import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY_METADATA = 'cache_key';
export const CACHE_TTL_METADATA = 'cache_ttl';
export const CACHE_PREFIX_METADATA = 'cache_prefix';

export interface CacheOptions {
  ttl?: number;
  prefix?: string;
}

export const Cacheable = (options?: CacheOptions): MethodDecorator => {
  return (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_TTL_METADATA, options?.ttl || 300)(target, propertyKey, descriptor);
    SetMetadata(CACHE_PREFIX_METADATA, options?.prefix || 'cache')(target, propertyKey, descriptor);
    return descriptor;
  };
};

export const CacheInvalidate = (pattern?: string): MethodDecorator => {
  return (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_KEY_METADATA, pattern)(target, propertyKey, descriptor);
    return descriptor;
  };
};
