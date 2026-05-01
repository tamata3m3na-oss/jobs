import { PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') {
      return value;
    }
    const result = this.schema.safeParse(value);
    if (result.success) {
      return result.data;
    }

    throw new BadRequestException({
      message: 'Validation failed',
      error: 'Bad Request',
      details: result.error.flatten().fieldErrors,
    });
  }
}
