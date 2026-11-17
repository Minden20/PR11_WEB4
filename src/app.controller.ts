import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service.js';
import { Public } from './auth/decorators/public.decorator.js';

@ApiTags('Службові')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Перевірка доступності API' })
  getHello(): string {
    return this.appService.getHello();
  }
}
