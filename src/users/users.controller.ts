import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UsersService, PublicUser } from './users.service.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from './entities/role.enum.js';
import { UserResponseDto } from '../auth/dto/auth-responses.dto.js';
import {
  ErrorResponseDto,
  ERROR_EXAMPLES,
} from '../common/dto/api-responses.dto.js';

@ApiTags('Користувачі (ADMIN)')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Відсутній або недійсний токен',
  type: ErrorResponseDto,
  example: ERROR_EXAMPLES.unauthorized,
})
@ApiForbiddenResponse({
  description: 'Доступ лише для ADMIN',
  type: ErrorResponseDto,
  example: ERROR_EXAMPLES.forbidden,
})
@Controller('users')
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Список користувачів' })
  @ApiOkResponse({ type: [UserResponseDto] })
  findAll(): Promise<PublicUser[]> {
    return this.usersService.findAll();
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Призначення ролі користувачу' })
  @ApiOkResponse({ description: 'Роль змінено', type: UserResponseDto })
  @ApiBadRequestResponse({
    description: 'Невідома роль',
    type: ErrorResponseDto,
    example: ERROR_EXAMPLES.badRequest,
  })
  @ApiNotFoundResponse({
    description: 'Користувача не знайдено',
    type: ErrorResponseDto,
    example: ERROR_EXAMPLES.notFound,
  })
  updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleDto,
  ): Promise<PublicUser> {
    return this.usersService.updateRole(id, dto.role);
  }
}
