import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../users/entities/role.enum.js';

export class AccessTokenDto {
  @ApiProperty({
    description: 'JWT Access Token (HS256), час життя 15 хвилин',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;
}

export class UserResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'client@example.com' })
  email: string;

  @ApiProperty({ enum: Role, enumName: 'Role', example: Role.CLIENT })
  role: Role;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
