import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ description: 'UUID страви', format: 'uuid' })
  @IsUUID('4')
  readonly productId: string;

  @ApiProperty({
    description: 'Кількість порцій',
    example: 2,
    minimum: 1,
    maximum: 100,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  readonly quantity: number;
}
