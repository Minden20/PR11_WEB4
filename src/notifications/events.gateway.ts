import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Public } from '../auth/decorators/public.decorator.js';

export const DELIVERY_ROOM_PATTERN = /^delivery_[A-Za-z0-9-]{1,64}$/;

export const deliveryRoom = (orderId: string) => `delivery_${orderId}`;

interface CourierLocation {
  orderId: string;
  lat: number;
  lng: number;
  etaMinutes?: number;
}

@Public()
@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(EventsGateway.name);

  @WebSocketServer()
  server: Server;

  afterInit(): void {
    this.logger.log('EventsGateway ініціалізовано');
  }

  handleConnection(client: Socket): void {
    this.logger.log(
      `Клієнт підключився: ${client.id} (активних: ${this.connectionsCount})`,
    );
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(
      `Клієнт відключився: ${client.id} (активних: ${this.connectionsCount})`,
    );
  }

  get connectionsCount(): number {
    return this.server?.engine?.clientsCount ?? 0;
  }

  get deliveryRoomsCount(): number {
    if (!this.server) {
      return 0;
    }
    return [...this.server.sockets.adapter.rooms.keys()].filter((room) =>
      DELIVERY_ROOM_PATTERN.test(room),
    ).length;
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  @SubscribeMessage('broadcastNotification')
  handleBroadcast(
    @MessageBody() message: unknown,
    @ConnectedSocket() client: Socket,
  ) {
    const text = typeof message === 'string' ? message.trim() : '';
    if (!text || text.length > 500) {
      throw new WsException(
        'Повідомлення має бути непорожнім рядком до 500 символів',
      );
    }
    const data = {
      sender: client.id,
      message: text,
      timestamp: new Date().toISOString(),
    };
    this.server.emit('globalAlert', data);
    this.logger.log(`globalAlert від ${client.id}: ${text}`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody('roomId') roomId: unknown,
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.validateRoom(roomId);
    await client.join(room);
    this.logger.log(`Клієнт ${client.id} приєднався до кімнати: ${room}`);
    client.emit('joined', { status: 'success', roomId: room });
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @MessageBody('roomId') roomId: unknown,
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.validateRoom(roomId);
    await client.leave(room);
    this.logger.log(`Клієнт ${client.id} покинув кімнату: ${room}`);
    client.emit('left', { status: 'success', roomId: room });
  }

  @SubscribeMessage('updateCourierLocation')
  handleCourierLocation(@MessageBody() body: CourierLocation) {
    const { orderId, lat, lng, etaMinutes } = body ?? ({} as CourierLocation);
    const room = this.validateRoom(deliveryRoom(String(orderId ?? '')));
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      Math.abs(lat) > 90 ||
      Math.abs(lng) > 180
    ) {
      throw new WsException('Некоректні координати кур’єра');
    }
    this.emitToRoom(room, 'courierLocationUpdated', {
      orderId,
      lat,
      lng,
      etaMinutes: etaMinutes ?? null,
      updatedAt: new Date().toISOString(),
    });
    return { status: 'sent', roomId: room };
  }

  emitToRoom(roomId: string, event: string, data: unknown): void {
    this.server.to(roomId).emit(event, data);
    this.logger.log(
      `Подію ${event} надіслано в кімнату ${roomId}: ${JSON.stringify(data)}`,
    );
  }

  private validateRoom(roomId: unknown): string {
    if (typeof roomId !== 'string' || !DELIVERY_ROOM_PATTERN.test(roomId)) {
      throw new WsException(
        'Назва кімнати має формат delivery_<orderId> (латиниця, цифри, дефіс)',
      );
    }
    return roomId;
  }
}
