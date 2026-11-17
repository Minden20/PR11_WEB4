import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import { Role } from '../users/entities/role.enum.js';

describe('AuthService', () => {
  let service: AuthService;
  const usersService = {
    create: vi.fn(),
    findByEmailWithPassword: vi.fn(),
    findById: vi.fn(),
  };
  const jwtService = { signAsync: vi.fn(async () => 'signed.jwt.token') };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  it('register делегує створення користувача з роллю за замовчуванням', async () => {
    usersService.create.mockResolvedValue({ id: 'u1', role: Role.CLIENT });
    await service.register({ email: 'a@b.com', password: 'secret1' });
    expect(usersService.create).toHaveBeenCalledWith('a@b.com', 'secret1');
  });

  it('login повертає accessToken з payload { sub, email, role }', async () => {
    usersService.findByEmailWithPassword.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      role: Role.CHEF,
      passwordHash: await bcrypt.hash('secret1', 4),
    });
    await expect(
      service.login({ email: 'a@b.com', password: 'secret1' }),
    ).resolves.toEqual({ accessToken: 'signed.jwt.token' });
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 'u1',
      email: 'a@b.com',
      role: Role.CHEF,
    });
  });

  it('login: невірний пароль дає UnauthorizedException', async () => {
    usersService.findByEmailWithPassword.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      role: Role.CLIENT,
      passwordHash: await bcrypt.hash('secret1', 4),
    });
    await expect(
      service.login({ email: 'a@b.com', password: 'wrong12' }),
    ).rejects.toThrow('Невірні облікові дані');
  });

  it('login: неіснуючий email дає UnauthorizedException', async () => {
    usersService.findByEmailWithPassword.mockResolvedValue(null);
    await expect(
      service.login({ email: 'x@b.com', password: 'secret1' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });
});
