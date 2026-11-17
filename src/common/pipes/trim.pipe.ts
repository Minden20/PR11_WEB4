import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

const TRIMMED_TYPES = new Set(['body', 'query', 'param']);

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};

@Injectable()
export class TrimPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata) {
    if (!TRIMMED_TYPES.has(metadata.type)) {
      return value;
    }
    return this.trim(value);
  }

  private trim(value: unknown): unknown {
    if (typeof value === 'string') {
      return value.trim();
    }
    if (Array.isArray(value)) {
      return value.map((item) => this.trim(item));
    }
    if (isPlainObject(value)) {
      for (const key of Object.keys(value)) {
        value[key] = this.trim(value[key]);
      }
    }
    return value;
  }
}
