import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from '../jwt-payload.interface.js';

export const CurrentUser = createParamDecorator(
  (field: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const user = ctx.switchToHttp().getRequest<{ user?: AuthUser }>().user;
    return field ? user?.[field] : user;
  },
);
