import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DishesController } from './dishes.controller.js';
import { DishesService } from './dishes.service.js';

const DISH = {
  id: '11111111-1111-4111-8111-111111111111',
  title: 'Український борщ',
  price: 195,
  weightGrams: 400,
  calories: 380,
  isSpicy: false,
  menuCategory: null,
  allergens: [],
};

describe('DishesController', () => {
  let controller: DishesController;
  const service = {
    findAll: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    restore: vi.fn(),
    findDeleted: vi.fn(),
    findBySlug: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DishesController],
      providers: [{ provide: DishesService, useValue: service }],
    }).compile();
    controller = module.get(DishesController);
  });

  it('повинен бути визначений', () => {
    expect(controller).toBeDefined();
  });

  it('create: викликає dishesService.create з DTO та повертає результат', async () => {
    const dto = {
      title: 'Український борщ',
      price: 195,
      weightGrams: 400,
      calories: 380,
      isSpicy: false,
      allergens: ['Глютен'],
    };
    service.create.mockResolvedValue({ ...DISH, ...dto });

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledTimes(1);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toMatchObject({ id: DISH.id, title: dto.title });
  });

  it('findAll: передає параметри запиту в сервіс', async () => {
    const page = {
      data: [DISH],
      meta: { page: 1, limit: 5, total: 1, totalPages: 1 },
    };
    service.findAll.mockResolvedValue(page);
    const query = {
      page: 1,
      limit: 5,
      sortBy: 'price',
      order: 'ASC',
      allergen: 'Глютен',
    } as const;

    await expect(controller.findAll(query)).resolves.toEqual(page);
    expect(service.findAll).toHaveBeenCalledWith(query);
  });

  it('findOne: повертає страву від сервісу', async () => {
    service.findOne.mockResolvedValue(DISH);
    await expect(controller.findOne(DISH.id)).resolves.toEqual(DISH);
    expect(service.findOne).toHaveBeenCalledWith(DISH.id);
  });

  it('findOne: передає далі NotFoundException із сервісу', async () => {
    service.findOne.mockRejectedValue(new NotFoundException());
    await expect(controller.findOne(DISH.id)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('update: передає id та DTO', async () => {
    service.update.mockResolvedValue({ ...DISH, price: 210 });
    await controller.update(DISH.id, { price: 210 });
    expect(service.update).toHaveBeenCalledWith(DISH.id, { price: 210 });
  });

  it('remove: делегує сервісу', async () => {
    service.remove.mockResolvedValue(undefined);
    await controller.remove(DISH.id);
    expect(service.remove).toHaveBeenCalledWith(DISH.id);
  });

  it('restore: делегує сервісу', async () => {
    service.restore.mockResolvedValue(DISH);
    await expect(controller.restore(DISH.id)).resolves.toEqual(DISH);
  });

  it('findDeleted, findBySlug, replace: делегують сервісу', async () => {
    service.findDeleted.mockResolvedValue([]);
    service.findBySlug.mockResolvedValue(DISH);
    service.update.mockResolvedValue(DISH);
    await expect(controller.findDeleted()).resolves.toEqual([]);
    await expect(controller.findBySlug('borshch')).resolves.toEqual(DISH);
    await controller.replace(DISH.id, { calories: 400 });
    expect(service.findBySlug).toHaveBeenCalledWith('borshch');
    expect(service.update).toHaveBeenCalledWith(DISH.id, { calories: 400 });
  });
});
