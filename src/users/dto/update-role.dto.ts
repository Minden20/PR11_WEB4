import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Role } from '../entities/role.enum.js';

export class UpdateRoleDto {
  @ApiProperty({
    description: 'Нова роль користувача',
    enum: Role,
    enumName: 'Role',
    example: Role.CHEF,
  })
  @IsEnum(Role)
  readonly role: Role;
}
