import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Email користувача (зберігається в нижньому регістрі)',
    example: 'client@example.com',
    format: 'email',
    maxLength: 255,
  })
  @IsEmail({}, { message: 'Некоректний формат email' })
  @MaxLength(255)
  readonly email: string;

  @ApiProperty({
    description: 'Пароль: 6–72 символи, щонайменше одна літера та одна цифра',
    example: 'strongPassword123',
    minLength: 6,
    maxLength: 72,
    format: 'password',
  })
  @IsString()
  @MinLength(6, { message: 'Пароль має містити щонайменше 6 символів' })
  @MaxLength(72, { message: 'Пароль не може бути довшим за 72 символи' })
  @Matches(/(?=.*[A-Za-zА-Яа-яІіЇїЄєҐґ])(?=.*\d)/, {
    message: 'Пароль має містити хоча б одну літеру та одну цифру',
  })
  readonly password: string;
}
