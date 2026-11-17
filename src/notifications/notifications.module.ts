import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway.js';
import { NotificationsController } from './notifications.controller.js';

@Module({
  controllers: [NotificationsController],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class NotificationsModule {}
