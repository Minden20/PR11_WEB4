import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard.js';
import { Role } from '../../users/entities/role.enum.js';

const contextFor = (user?: { role: Role }) =>
  ({
    getHandler: () => () => undefined,
    getClass: () => class {},
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  }) as unknown as ExecutionContext;

describe('RolesGuard', () => {
  const reflector = { getAllAndOverride: vi.fn() };
  const guard = new RolesGuard(reflector as unknown as Reflector);

  it('пропускає маршрут без @Roles', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    expect(guard.canActivate(contextFor({ role: Role.CLIENT }))).toBe(true);
  });

  it('пропускає дозволену роль', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.CHEF, Role.ADMIN]);
    expect(guard.canActivate(contextFor({ role: Role.CHEF }))).toBe(true);
  });

  it('кидає ForbiddenException для CLIENT', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.CHEF, Role.ADMIN]);
    expect(() => guard.canActivate(contextFor({ role: Role.CLIENT }))).toThrow(
      new ForbiddenException('Недостатньо прав для виконання операції'),
    );
  });
});
