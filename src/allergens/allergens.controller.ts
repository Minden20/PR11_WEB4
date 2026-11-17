import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AllergensService } from './allergens.service.js';
import { AllergenEntity } from './entities/allergen.entity.js';
import { CreateAllergenDto } from './dto/create-allergen.dto.js';
import { Public } from '../auth/decorators/public.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '../users/entities/role.enum.js';

@ApiTags('Алергени')
@Controller('allergens')
export class AllergensController {
  constructor(private readonly allergensService: AllergensService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Довідник алергенів' })
  findAll(): Promise<AllergenEntity[]> {
    return this.allergensService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Алерген разом зі стравами, що його містять' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<AllergenEntity> {
    return this.allergensService.findOne(id);
  }

  @Roles(Role.CHEF, Role.ADMIN)
  @ApiBearerAuth()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Додавання алергену (CHEF, ADMIN)' })
  create(@Body() dto: CreateAllergenDto): Promise<AllergenEntity> {
    return this.allergensService.create(dto);
  }

  @Roles(Role.CHEF, Role.ADMIN)
  @ApiBearerAuth()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Видалення алергену (CHEF, ADMIN)' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.allergensService.remove(id);
  }
}
