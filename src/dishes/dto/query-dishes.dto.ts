import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export const DISH_SORT_FIELDS = [
  'createdAt',
  'updatedAt',
  'title',
  'price',
  'weightGrams',
  'calories',
] as const;
export type DishSortField = (typeof DISH_SORT_FIELDS)[number];

export class QueryDishesDto {
  @ApiPropertyOptional({
    description: 'Номер сторінки',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Кількість записів на сторінці',
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Поле сортування',
    enum: DISH_SORT_FIELDS,
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn(DISH_SORT_FIELDS)
  sortBy: DishSortField = 'createdAt';

  @ApiPropertyOptional({
    description: 'Напрям сортування (регістр не важливий)',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsIn(['ASC', 'DESC'])
  order: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({ description: 'Пошук у назві', example: 'борщ' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Лише гострі / негострі страви' })
  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' || value === '1'
      ? true
      : value === 'false' || value === '0'
        ? false
        : value,
  )
  @IsBoolean()
  isSpicy?: boolean;

  @ApiPropertyOptional({ description: 'Максимальна ціна', example: 300 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'UUID розділу меню', format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  menuCategoryId?: string;

  @ApiPropertyOptional({
    description: 'Назва алергену (без урахування регістру)',
    example: 'Молоко',
  })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  allergen?: string;

  @ApiPropertyOptional({ description: 'UUID алергену', format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  allergenId?: string;
}
