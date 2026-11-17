import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './entities/user.entity.js';
import { Role } from './entities/role.enum.js';

export const SALT_ROUNDS = 10;

export type PublicUser = Omit<UserEntity, 'passwordHash'>;

@Injectable()
export class UsersService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) {
      return;
    }
    if (await this.userRepo.existsBy({ email: email.toLowerCase() })) {
      return;
    }
    await this.create(email, password, Role.ADMIN);
    this.logger.log(`Створено адміністратора ${email.toLowerCase()}`);
  }

  async create(
    email: string,
    password: string,
    role: Role = Role.CLIENT,
  ): Promise<PublicUser> {
    const normalized = email.toLowerCase();
    if (await this.userRepo.existsBy({ email: normalized })) {
      throw new ConflictException('Користувач з таким email вже існує');
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const saved = await this.userRepo.save(
      this.userRepo.create({ email: normalized, passwordHash, role }),
    );
    return this.toPublic(saved);
  }

  findByEmailWithPassword(email: string): Promise<UserEntity | null> {
    return this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email: email.toLowerCase() })
      .getOne();
  }

  async findById(id: string): Promise<PublicUser> {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`Користувача з ID ${id} не знайдено`);
    }
    return user;
  }

  findAll(): Promise<PublicUser[]> {
    return this.userRepo.find({ order: { createdAt: 'ASC' } });
  }

  async updateRole(id: string, role: Role): Promise<PublicUser> {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`Користувача з ID ${id} не знайдено`);
    }
    user.role = role;
    return this.userRepo.save(user);
  }

  private toPublic(user: UserEntity): PublicUser {
    const { passwordHash: _, ...rest } = user;
    return rest;
  }
}
