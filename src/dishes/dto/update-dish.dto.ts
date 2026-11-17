import { ApiPropertyOptional } from '@nestjs/swagger';
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
  ValidateIf,
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
} from 'class-validator';
import { DISH_LIMITS } from './create-dish.dto.js';

export class UpdateDishDto {
  @ApiPropertyOptional({
    description: 'Нова назва страви (slug буде перегенеровано)',
    example: 'Борщ український з пампушками',
    maxLength: 120,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Назва страви не може бути порожньою' })
  @MaxLength(120)
  readonly title?: string;

  @ApiPropertyOptional({
    description: 'Нова ціна в гривнях',
    example: 215.5,
    minimum: 0.01,
    maximum: 999999.99,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Ціна має бути числом' })
  @IsPositive({ message: 'Ціна має бути додатною' })
  @Max(999999.99)
  readonly price?: number;

  @ApiPropertyOptional({
    description: 'Вага порції в грамах',
    example: 450,
    minimum: DISH_LIMITS.minWeightGrams,
    maximum: DISH_LIMITS.maxWeightGrams,
    type: 'integer',
  })
  @IsOptional()
  @IsInt({ message: 'Вага має бути цілим числом грамів' })
  @Min(DISH_LIMITS.minWeightGrams, {
    message: `Вага страви не може бути меншою за ${DISH_LIMITS.minWeightGrams} г`,
  })
  @Max(DISH_LIMITS.maxWeightGrams, {
    message: `Вага страви не може перевищувати ${DISH_LIMITS.maxWeightGrams} г`,
  })
  readonly weightGrams?: number;

  @ApiPropertyOptional({
    description: 'Калорійність порції, ккал',
    example: 420,
    minimum: 0,
    maximum: DISH_LIMITS.maxCalories,
    type: 'integer',
  })
  @IsOptional()
  @IsInt({ message: 'Калорійність має бути цілим числом' })
  @Min(0, { message: 'Калорійність не може бути від’ємною' })
  @Max(DISH_LIMITS.maxCalories, {
    message: `Калорійність не може перевищувати ${DISH_LIMITS.maxCalories} ккал`,
  })
  readonly calories?: number;

  @ApiPropertyOptional({ description: 'Чи гостра страва', example: true })
  @IsOptional()
  @IsBoolean()
  readonly isSpicy?: boolean;

  @ApiPropertyOptional({
    description: 'UUID розділу меню; null відв’язує страву від розділу',
    example: 'a507eeeb-4a88-4848-805a-87dd4a93ca26',
    format: 'uuid',
    nullable: true,
    type: String,
  })
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsUUID('4')
  readonly menuCategoryId?: string | null;

  @ApiPropertyOptional({
    description: 'Повна заміна набору алергенів',
    example: ['Глютен', 'Молоко'],
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
