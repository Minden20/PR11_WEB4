import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MenuCategoriesService } from './menu-categories.service.js';
import { MenuCategoryEntity } from './entities/menu-category.entity.js';
import { CreateMenuCategoryDto } from './dto/create-menu-category.dto.js';
import { UpdateMenuCategoryDto } from './dto/update-menu-category.dto.js';
import { Public } from '../auth/decorators/public.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '../users/entities/role.enum.js';

@ApiTags('Розділи меню')
@Controller('menu-categories')
export class MenuCategoriesController {
  constructor(private readonly categoriesService: MenuCategoriesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Список розділів меню' })
  findAll(): Promise<MenuCategoryEntity[]> {
    return this.categoriesService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Розділ меню разом зі стравами' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<MenuCategoryEntity> {
    return this.categoriesService.findOne(id);
  }

  @Roles(Role.CHEF, Role.ADMIN)
  @ApiBearerAuth()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Створення розділу меню (CHEF, ADMIN)' })
  create(@Body() dto: CreateMenuCategoryDto): Promise<MenuCategoryEntity> {
    return this.categoriesService.create(dto);
  }

  @Roles(Role.CHEF, Role.ADMIN)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Оновлення розділу меню (CHEF, ADMIN)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMenuCategoryDto,
  ): Promise<MenuCategoryEntity> {
    return this.categoriesService.update(id, dto);
  }

  @Roles(Role.CHEF, Role.ADMIN)
  @ApiBearerAuth()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      'Видалення розділу меню; страви лишаються без розділу (CHEF, ADMIN)',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.categoriesService.remove(id);
  }
}
