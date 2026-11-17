import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { AccessTokenDto, UserResponseDto } from './dto/auth-responses.dto.js';
import { Public } from './decorators/public.decorator.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { PublicUser } from '../users/users.service.js';
import {
  ErrorResponseDto,
  ERROR_EXAMPLES,
} from '../common/dto/api-responses.dto.js';

@ApiTags('Автентифікація')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Реєстрація клієнта (роль CLIENT)' })
  @ApiCreatedResponse({
    description: 'Користувача створено',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некоректний email або слабкий пароль',
    type: ErrorResponseDto,
    example: ERROR_EXAMPLES.badRequest,
  })
  @ApiConflictResponse({
    description: 'Email вже зареєстровано',
    type: ErrorResponseDto,
    example: ERROR_EXAMPLES.conflict,
  })
  register(@Body() dto: RegisterDto): Promise<PublicUser> {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Логін і отримання Access Token',
    description:
      'Отриманий токен вставте у вікно «Authorize» для виклику захищених маршрутів.',
  })
  @ApiOkResponse({ description: 'Успішний вхід', type: AccessTokenDto })
  @ApiBadRequestResponse({
    description: 'Некоректні вхідні дані',
    type: ErrorResponseDto,
    example: ERROR_EXAMPLES.badRequest,
  })
  @ApiUnauthorizedResponse({
    description: 'Невірні облікові дані',
    type: ErrorResponseDto,
    example: ERROR_EXAMPLES.unauthorized,
  })
  login(@Body() dto: LoginDto): Promise<{ accessToken: string }> {
    return this.authService.login(dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Профіль поточного користувача' })
  @ApiOkResponse({
    description: 'Дані користувача без хешу пароля',
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Відсутній або недійсний токен',
    type: ErrorResponseDto,
    example: ERROR_EXAMPLES.unauthorized,
  })
  me(@CurrentUser('id') userId: string): Promise<PublicUser> {
    return this.authService.me(userId);
  }
}
