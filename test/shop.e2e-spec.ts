import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('Автентифікація та RBAC (e2e)', () => {
  let app: INestApplication<App>;
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@food.local';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin12345';

  beforeAll(async () => {
    process.env.ADMIN_EMAIL = adminEmail;
    process.env.ADMIN_PASSWORD = adminPassword;
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('register → login → me → 403 для CLIENT → CHEF керує меню', async () => {
    const server = app.getHttpServer();
    const suffix = Date.now();
    const client = { email: `client${suffix}@e2e.test`, password: 'secret12' };
    const chef = { email: `chef${suffix}@e2e.test`, password: 'secret34' };

    const registered = await request(server)
      .post('/auth/register')
      .send(client)
      .expect(201);
    expect(registered.body.role).toBe('CLIENT');
    expect(registered.body.passwordHash).toBeUndefined();

    await request(server).post('/auth/register').send(client).expect(409);
    await request(server)
      .post('/auth/register')
      .send({ email: 'bad', password: '1' })
      .expect(400);
    await request(server)
      .post('/auth/login')
      .send({ ...client, password: 'wrong999' })
      .expect(401);

    const login = await request(server)
      .post('/auth/login')
      .send(client)
      .expect(200);
    const clientToken = login.body.accessToken;

    const me = await request(server)
      .get('/auth/me')
      .set('Authorization', `Bearer ${clientToken}`)
      .expect(200);
    expect(me.body.email).toBe(client.email);
    await request(server).get('/auth/me').expect(401);

    await request(server).get('/dishes').expect(200);
    const dish = {
      title: `E2E страва ${suffix}`,
      price: 120,
      weightGrams: 200,
      calories: 300,
      isSpicy: false,
    };
    await request(server).post('/dishes').send(dish).expect(401);
    const forbidden = await request(server)
      .post('/dishes')
      .set('Authorization', `Bearer ${clientToken}`)
      .send(dish)
      .expect(403);
    expect(forbidden.body.message).toBe(
      'Недостатньо прав для виконання операції',
    );

    const adminToken = (
      await request(server)
        .post('/auth/login')
        .send({ email: adminEmail, password: adminPassword })
        .expect(200)
    ).body.accessToken;
    const chefUser = (
      await request(server).post('/auth/register').send(chef).expect(201)
    ).body;
    await request(server)
      .patch(`/users/${chefUser.id}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'CHEF' })
      .expect(200);

    const chefToken = (
      await request(server).post('/auth/login').send(chef).expect(200)
    ).body.accessToken;
    const created = await request(server)
      .post('/dishes')
      .set('Authorization', `Bearer ${chefToken}`)
      .send(dish)
      .expect(201);
    await request(server)
      .delete(`/dishes/${created.body.id}`)
      .set('Authorization', `Bearer ${chefToken}`)
      .expect(204);
    await request(server)
      .get('/users')
      .set('Authorization', `Bearer ${chefToken}`)
      .expect(403);
  });
});
