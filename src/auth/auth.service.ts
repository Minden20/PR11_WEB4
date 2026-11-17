import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService, PublicUser } from '../users/users.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtPayload } from './jwt-payload.interface.js';

const DUMMY_HASH = bcrypt.hashSync('timing-attack-protection', 10);

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  register(dto: RegisterDto): Promise<PublicUser> {
    return this.usersService.create(dto.email, dto.password);
  }

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    const user = await this.usersService.findByEmailWithPassword(dto.email);
    const isMatch = await bcrypt.compare(
      dto.password,
      user?.passwordHash ?? DUMMY_HASH,
    );
    if (!user || !isMatch) {
      throw new UnauthorizedException('Невірні облікові дані');
    }
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return { accessToken: await this.jwtService.signAsync(payload) };
  }

  me(userId: string): Promise<PublicUser> {
    return this.usersService.findById(userId);
  }
}
