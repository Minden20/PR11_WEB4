import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Email користувача',
    example: 'admin@food.local',
    format: 'email',
  })
  @IsEmail({}, { message: 'Некоректний формат email' })
  readonly email: string;

  @ApiProperty({
    description: 'Пароль',
    example: 'Admin12345',
    format: 'password',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(72)
  readonly password: string;
}
