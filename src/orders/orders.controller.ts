import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { Order } from './entities/order.entity.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '../users/entities/role.enum.js';
import type { AuthUser } from '../auth/jwt-payload.interface.js';

@ApiTags('Замовлення')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Roles(Role.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Усі замовлення (ADMIN)' })
  findAll(): Order[] {
    return this.ordersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Замовлення за ID (власник або ADMIN)' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser): Order {
    const order = this.ordersService.findOne(id);
    if (user.role !== Role.ADMIN && order.customerId !== user.id) {
      throw new ForbiddenException('Недостатньо прав для виконання операції');
    }
    return order;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Оформлення замовлення від імені поточного користувача',
  })
  createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser('id') customerId: string,
  ): Promise<Order> {
    return this.ordersService.createOrder(createOrderDto, customerId);
  }
}
