import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateDishDto } from './create-dish.dto.js';

const valid = {
  title: 'Український борщ',
  price: 195,
  weightGrams: 400,
  calories: 380,
  isSpicy: false,
};

const messagesFor = async (payload: object) => {
  const errors = await validate(plainToInstance(CreateDishDto, payload));
  return errors.flatMap((e) => Object.values(e.constraints ?? {}));
};

describe('CreateDishDto: граничні випадки варіанта 4', () => {
  it('приймає коректну страву', async () => {
    await expect(messagesFor(valid)).resolves.toEqual([]);
  });

  it('відхиляє від’ємну вагу', async () => {
    await expect(
      messagesFor({ ...valid, weightGrams: -250 }),
    ).resolves.toContain('Вага страви не може бути меншою за 10 г');
  });

  it('відхиляє дробову вагу', async () => {
    await expect(
      messagesFor({ ...valid, weightGrams: 250.5 }),
    ).resolves.toContain('Вага має бути цілим числом грамів');
  });

  it('відхиляє від’ємну калорійність', async () => {
    await expect(messagesFor({ ...valid, calories: -1 })).resolves.toContain(
      'Калорійність не може бути від’ємною',
    );
  });

  it('відхиляє нереалістично високу калорійність', async () => {
    await expect(messagesFor({ ...valid, calories: 99999 })).resolves.toContain(
      'Калорійність не може перевищувати 5000 ккал',
    );
  });

  it('граничні значення 10 г і 0 / 5000 ккал допустимі', async () => {
    await expect(
      messagesFor({ ...valid, weightGrams: 10, calories: 0 }),
    ).resolves.toEqual([]);
    await expect(messagesFor({ ...valid, calories: 5000 })).resolves.toEqual(
      [],
    );
  });
});
