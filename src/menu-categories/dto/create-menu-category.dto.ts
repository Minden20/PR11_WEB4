import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateMenuCategoryDto {
  @ApiProperty({
    description: 'Назва розділу меню',
    example: 'Гарячі страви',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  readonly name: string;

  @ApiPropertyOptional({ description: 'Опис розділу', example: 'Основне меню' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  readonly description?: string;

  @ApiPropertyOptional({
    description: 'Порядок у меню',
    example: 5,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  readonly sortOrder?: number;
}
