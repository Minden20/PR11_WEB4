import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Min,
  Max,
  IsBoolean,
  IsInt,
  IsOptional,
  IsUUID,
  MaxLength,
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
} from 'class-validator';

export const DISH_LIMITS = {
  minWeightGrams: 10,
  maxWeightGrams: 5000,
  maxCalories: 5000,
} as const;

export class CreateDishDto {
  @ApiProperty({
    description: 'Назва страви',
    example: 'Український борщ із пампушками',
    maxLength: 120,
  })
  @IsString()
  @IsNotEmpty({ message: 'Назва страви не може бути порожньою' })
  @MaxLength(120)
  readonly title: string;

  @ApiProperty({
    description: 'Ціна в гривнях, не більше 2 знаків після коми',
    example: 195.5,
    minimum: 0.01,
    maximum: 999999.99,
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Ціна має бути числом' })
  @IsPositive({ message: 'Ціна має бути додатною' })
  @Max(999999.99)
  readonly price: number;

  @ApiProperty({
    description: 'Вага порції в грамах',
    example: 400,
    minimum: DISH_LIMITS.minWeightGrams,
    maximum: DISH_LIMITS.maxWeightGrams,
    type: 'integer',
  })
  @IsInt({ message: 'Вага має бути цілим числом грамів' })
  @Min(DISH_LIMITS.minWeightGrams, {
    message: `Вага страви не може бути меншою за ${DISH_LIMITS.minWeightGrams} г`,
  })
  @Max(DISH_LIMITS.maxWeightGrams, {
    message: `Вага страви не може перевищувати ${DISH_LIMITS.maxWeightGrams} г`,
  })
  readonly weightGrams: number;

  @ApiProperty({
    description: 'Калорійність порції, ккал',
    example: 380,
    minimum: 0,
    maximum: DISH_LIMITS.maxCalories,
    type: 'integer',
  })
  @IsInt({ message: 'Калорійність має бути цілим числом' })
  @Min(0, { message: 'Калорійність не може бути від’ємною' })
  @Max(DISH_LIMITS.maxCalories, {
    message: `Калорійність не може перевищувати ${DISH_LIMITS.maxCalories} ккал`,
  })
  readonly calories: number;

  @ApiProperty({ description: 'Чи гостра страва', example: false })
  @IsBoolean()
  readonly isSpicy: boolean;

  @ApiPropertyOptional({
    description: 'UUID розділу меню',
    example: 'a507eeeb-4a88-4848-805a-87dd4a93ca26',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('4')
  readonly menuCategoryId?: string;

  @ApiPropertyOptional({
    description:
      'Назви алергенів; відсутні в довіднику створюються автоматично (cascade)',
    example: ['Глютен', 'Селера'],
    type: [String],
    maxItems: 14,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(14)
  @ArrayUnique((name: unknown) => String(name).toLowerCase())
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(60, { each: true })
  readonly allergens?: string[];
}
