import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAllergenDto {
  @ApiProperty({
    description: 'Назва алергену',
    example: 'Кунжут',
    maxLength: 60,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  readonly name: string;

  @ApiPropertyOptional({
    description: 'Опис',
    example: 'Насіння та олія кунжуту',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  readonly description?: string;
}
