import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { Role } from '../users/entities/role.enum.js';

describe('OrdersController', () => {
  let controller: OrdersController;
  const service = {
    findAll: vi.fn(() => []),
    findOne: vi.fn(() => ({ id: 'o1', customerId: 'u1' })),
    createOrder: vi.fn(async (dto, customerId) => ({
      id: 'o1',
      customerId,
      ...dto,
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: service }],
    }).compile();
    controller = module.get(OrdersController);
  });

  it('findAll', () => {
    expect(controller.findAll()).toEqual([]);
  });

  it('createOrder передає id поточного користувача', async () => {
    await expect(
      controller.createOrder({ productId: 'p', quantity: 1 }, 'u1'),
    ).resolves.toMatchObject({ id: 'o1', productId: 'p', customerId: 'u1' });
  });

  it('findOne: власник бачить своє замовлення', () => {
    expect(
      controller.findOne('o1', { id: 'u1', email: 'a@b.c', role: Role.CLIENT }),
    ).toMatchObject({ id: 'o1' });
  });

  it('findOne: чуже замовлення доступне лише ADMIN', () => {
    expect(() =>
      controller.findOne('o1', { id: 'u2', email: 'x@b.c', role: Role.CHEF }),
    ).toThrow(ForbiddenException);
    expect(
      controller.findOne('o1', { id: 'u3', email: 'z@b.c', role: Role.ADMIN }),
    ).toMatchObject({ id: 'o1' });
  });
});
