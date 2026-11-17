import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

export const SWAGGER_PATH = 'api/docs';

export function createSwaggerDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Gourmet Express Delivery API')
    .setDescription(
      'Технічна документація REST API сервісу доставки їжі (варіант 4): меню страв, розділи меню, алергени, замовлення, автентифікація та RBAC. ' +
        'Публічні маршрути доступні без токена. Для захищених: виконайте POST /auth/login, натисніть «Authorize» і вставте accessToken.',
    )
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Access Token з POST /auth/login',
    })
    .build();
  return SwaggerModule.createDocument(app, config);
}

export function setupSwagger(app: INestApplication): void {
  SwaggerModule.setup(SWAGGER_PATH, app, () => createSwaggerDocument(app), {
    customSiteTitle: 'Gourmet Express Delivery API',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'method',
    },
  });
}
