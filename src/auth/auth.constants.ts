export const jwtAccessSecret = (): string =>
  process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret';

export const jwtAccessExpiresIn = (): string =>
  process.env.JWT_ACCESS_EXPIRES_IN ?? '15m';
