import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { DishesService } from './dishes.service.js';
import { CreateDishDto } from './dto/create-dish.dto.js';
import { UpdateDishDto } from './dto/update-dish.dto.js';
import { QueryDishesDto } from './dto/query-dishes.dto.js';
import { PaginatedDishesDto } from './dto/paginated-dishes.dto.js';
import { DishEntity } from './entities/dish.entity.js';
import { Paginated } from '../common/interfaces/paginated.interface.js';
import {
  ErrorResponseDto,
  ERROR_EXAMPLES,
} from '../common/dto/api-responses.dto.js';
import { Public } from '../auth/decorators/public.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '../users/entities/role.enum.js';

const ID_PARAM = {
  name: 'id',
  description: 'UUID страви',
  format: 'uuid',
  example: '2bef71da-bafc-4bb0-b482-76eec220e1ce',
} as const;

@ApiTags('Меню та доставка страв')
@ApiBadRequestResponse({
  description: 'Некоректні вхідні дані (помилка валідації)',
  type: ErrorResponseDto,
  example: ERROR_EXAMPLES.badRequest,
})
@Controller('dishes')
export class DishesController {
  constructor(private readonly dishesService: DishesService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Список страв',
    description:
      'Пагінація, сортування та фільтри: пошук за назвою, гострота, максимальна ціна, розділ меню, алерген (назва або UUID).',
  })
  @ApiOkResponse({ description: 'Сторінка страв', type: PaginatedDishesDto })
  findAll(@Query() query: QueryDishesDto): Promise<Paginated<DishEntity>> {
    return this.dishesService.findAll(query);
  }

  @Roles(Role.CHEF, Role.ADMIN)
  @Get('deleted')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Кошик: м’яко видалені страви (CHEF, ADMIN)' })
  @ApiOkResponse({ description: 'Список видалених страв', type: [DishEntity] })
  @ApiUnauthorizedResponse({
    description: 'Відсутній або недійсний токен',
    type: ErrorResponseDto,
    example: ERROR_EXAMPLES.unauthorized,
  })
  @ApiForbiddenResponse({
    description: 'Недостатньо прав',
    type: ErrorResponseDto,
    example: ERROR_EXAMPLES.forbidden,
  })
  findDeleted(): Promise<DishEntity[]> {
    return this.dishesService.findDeleted();
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Страва за slug' })
  @ApiParam({ name: 'slug', example: 'ukrayinskyi-borshch-iz-pampushkamy' })
  @ApiOkResponse({ description: 'Страва знайдена', type: DishEntity })
  @ApiNotFoundResponse({
    description: 'Страву не знайдено',
    type: ErrorResponseDto,
    example: ERROR_EXAMPLES.notFound,
  })
  findBySlug(@Param('slug') slug: string): Promise<DishEntity> {
    return this.dishesService.findBySlug(slug);
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Страва за UUID разом із розділом меню та алергенами',
  })
  @ApiParam(ID_PARAM)
  @ApiOkResponse({ description: 'Страва знайдена', type: DishEntity })
  @ApiNotFoundResponse({
    description: 'Страву не знайдено',
    type: ErrorResponseDto,
    example: ERROR_EXAMPLES.notFound,
  })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<DishEntity> {
    return this.dishesService.findOne(id);
  }

  @Roles(Role.CHEF, Role.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Створення страви (CHEF, ADMIN)',
    description: 'Нові алергени зі списку створюються автоматично (cascade).',
  })
  @ApiCreatedResponse({
    description: 'Страву успішно додано до меню',
    type: DishEntity,
  })
  @ApiUnauthorizedResponse({
    description: 'Відсутній або недійсний токен',
    type: ErrorResponseDto,
    example: ERROR_EXAMPLES.unauthorized,
  })
  @ApiForbiddenResponse({
    description: 'Недостатньо прав',
    type: ErrorResponseDto,
    example: ERROR_EXAMPLES.forbidden,
  })
  @ApiNotFoundResponse({
    description: 'Розділ меню не знайдено',
    type: ErrorResponseDto,
    example: ERROR_EXAMPLES.notFound,
  })
  create(@Body() dto: CreateDishDto): Promise<DishEntity> {
    return this.dishesService.create(dto);
  }

  @Roles(Role.CHEF, Role.ADMIN)
  @Patch(':id/restore')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Відновлення м’яко видаленої страви (CHEF, ADMIN)' })
  @ApiParam(ID_PARAM)
  @ApiOkResponse({ description: 'Страву відновлено', type: DishEntity })
  @ApiUnauthorizedResponse({
    description: 'Відсутній або недійсний токен',
    type: ErrorResponseDto,
    example: ERROR_EXAMPLES.unauthorized,
  })
  @ApiForbiddenResponse({
    description: 'Недостатньо прав',
    type: ErrorResponseDto,
    example: ERROR_EXAMPLES.forbidden,
  })
  @ApiNotFoundResponse({
    description: 'Страву не знайдено',
    type: ErrorResponseDto,
    example: ERROR_EXAMPLES.notFound,
  })
  restore(@Param('id', ParseUUIDPipe) id: string): Promise<DishEntity> {
    return this.dishesService.restore(id);
  }

  @Roles(Role.CHEF, Role.ADMIN)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Часткове оновлення страви (CHEF, ADMIN)' })
  @ApiParam(ID_PARAM)
  @ApiOkResponse({ description: 'Страву оновлено', type: DishEntity })
  @ApiUnauthorizedResponse({
    description: 'Відсутній або недійсний токен',
    type: ErrorResponseDto,
    example: ERROR_EXAMPLES.unauthorized,
  })
  @ApiForbiddenResponse({
    description: 'Недостатньо прав',
    type: ErrorResponseDto,
    example: ERROR_EXAMPLES.forbidden,
  })
  @ApiNotFoundResponse({
    description: 'Страву або розділ меню не знайдено',
    type: ErrorResponseDto,
    example: ERROR_EXAMPLES.notFound,
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDishDto,
  ): Promise<DishEntity> {
    return this.dishesService.update(id, dto);
  }

  @Roles(Role.CHEF, Role.ADMIN)
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Оновлення страви через PUT (CHEF, ADMIN)' })
  @ApiParam(ID_PARAM)
  @ApiOkResponse({ description: 'Страву оновлено', type: DishEntity })
  @ApiUnauthorizedResponse({
    description: 'Відсутній або недійсний токен',
    type: ErrorResponseDto,
    example: ERROR_EXAMPLES.unauthorized,
  })
  @ApiForbiddenResponse({
    description: 'Недостатньо прав',
    type: ErrorResponseDto,
    example: ERROR_EXAMPLES.forbidden,
  })
  @ApiNotFoundResponse({
    description: 'Страву або розділ меню не знайдено',
    type: ErrorResponseDto,
    example: ERROR_EXAMPLES.notFound,
  })
  replace(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDishDto,
  ): Promise<DishEntity> {
    return this.dishesService.update(id, dto);
  }

  @Roles(Role.CHEF, Role.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'М’яке видалення страви (CHEF, ADMIN)' })
  @ApiParam(ID_PARAM)
  @ApiNoContentResponse({ description: 'Страву видалено' })
  @ApiUnauthorizedResponse({
    description: 'Відсутній або недійсний токен',
    type: ErrorResponseDto,
    example: ERROR_EXAMPLES.unauthorized,
  })
  @ApiForbiddenResponse({
    description: 'Недостатньо прав',
    type: ErrorResponseDto,
    example: ERROR_EXAMPLES.forbidden,
  })
  @ApiNotFoundResponse({
    description: 'Страву не знайдено',
    type: ErrorResponseDto,
    example: ERROR_EXAMPLES.notFound,
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.dishesService.remove(id);
  }
}
