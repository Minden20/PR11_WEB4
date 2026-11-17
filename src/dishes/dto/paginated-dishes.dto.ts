import { ApiProperty } from '@nestjs/swagger';
import { DishEntity } from '../entities/dish.entity.js';
import { PaginationMetaDto } from '../../common/dto/api-responses.dto.js';

export class PaginatedDishesDto {
  @ApiProperty({ type: () => [DishEntity] })
  data: DishEntity[];

  @ApiProperty({ type: () => PaginationMetaDto })
  meta: PaginationMetaDto;
}
