import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({
    description: 'Текст помилки або масив повідомлень валідації',
    oneOf: [
      { type: 'string', example: 'Сутність з ID ... не знайдена' },
      {
        type: 'array',
        items: { type: 'string' },
        example: ['Калорійність не може бути від’ємною'],
      },
    ],
  })
  message: string | string[];

  @ApiProperty({ example: 'Bad Request', required: false })
  error?: string;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 25 })
  total: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}

export const ERROR_EXAMPLES = {
  badRequest: {
    statusCode: 400,
    message: [
      'Вага страви не може бути меншою за 10 г',
      'Калорійність не може перевищувати 5000 ккал',
    ],
    error: 'Bad Request',
  },
  unauthorized: { statusCode: 401, message: 'Unauthorized' },
  forbidden: {
    statusCode: 403,
    message: 'Недостатньо прав для виконання операції',
    error: 'Forbidden',
  },
  notFound: {
    statusCode: 404,
    message: 'Сутність з ID 2bef71da-bafc-4bb0-b482-76eec220e1ce не знайдена',
    error: 'Not Found',
  },
  conflict: {
    statusCode: 409,
    message: 'Користувач з таким email вже існує',
    error: 'Conflict',
  },
} as const;
