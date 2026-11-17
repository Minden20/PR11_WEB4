import { WsException } from '@nestjs/websockets';
import { EventsGateway } from './events.gateway.js';

const makeClient = (id = 'socket-1') => ({
  id,
  emit: vi.fn(),
  join: vi.fn(async () => undefined),
  leave: vi.fn(async () => undefined),
});

describe('EventsGateway', () => {
  let gateway: EventsGateway;
  const roomEmit = vi.fn();
  const server = {
    emit: vi.fn(),
    to: vi.fn(() => ({ emit: roomEmit })),
    engine: { clientsCount: 3 },
    sockets: {
      adapter: {
        rooms: new Map([
          ['socket-1', new Set()],
          ['delivery_101', new Set()],
          ['delivery_202', new Set()],
        ]),
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    gateway = new EventsGateway();
    gateway.server = server as never;
  });

  it('ping відповідає подією pong з таймстемпом', () => {
    const client = makeClient();
    gateway.handlePing(client as never);
    expect(client.emit).toHaveBeenCalledWith('pong', {
      timestamp: expect.any(String),
    });
  });

  it('broadcastNotification транслює globalAlert усім сокетам', () => {
    gateway.handleBroadcast('  Знижка 20%  ', makeClient() as never);
    expect(server.emit).toHaveBeenCalledWith(
      'globalAlert',
      expect.objectContaining({ sender: 'socket-1', message: 'Знижка 20%' }),
    );
  });

  it('broadcastNotification відхиляє порожнє повідомлення', () => {
    expect(() => gateway.handleBroadcast('   ', makeClient() as never)).toThrow(
      WsException,
    );
    expect(server.emit).not.toHaveBeenCalled();
  });

  it('joinRoom / leaveRoom працюють лише з кімнатами delivery_<orderId>', async () => {
    const client = makeClient();
    await gateway.handleJoinRoom('delivery_101', client as never);
    expect(client.join).toHaveBeenCalledWith('delivery_101');
    expect(client.emit).toHaveBeenCalledWith('joined', {
      status: 'success',
      roomId: 'delivery_101',
    });
    await gateway.handleLeaveRoom('delivery_101', client as never);
    expect(client.leave).toHaveBeenCalledWith('delivery_101');
    await expect(
      gateway.handleJoinRoom('kitchen', client as never),
    ).rejects.toThrow(WsException);
  });

  it('updateCourierLocation надсилає подію лише в кімнату замовлення', () => {
    const ack = gateway.handleCourierLocation({
      orderId: '101',
      lat: 50.45,
      lng: 30.52,
      etaMinutes: 10,
    });
    expect(server.to).toHaveBeenCalledWith('delivery_101');
    expect(roomEmit).toHaveBeenCalledWith(
      'courierLocationUpdated',
      expect.objectContaining({ orderId: '101', lat: 50.45, lng: 30.52 }),
    );
    expect(ack).toEqual({ status: 'sent', roomId: 'delivery_101' });
  });

  it('updateCourierLocation відхиляє некоректні координати', () => {
    expect(() =>
      gateway.handleCourierLocation({ orderId: '101', lat: 120, lng: 30 }),
    ).toThrow(WsException);
  });

  it('рахує підключення та кімнати доставки', () => {
    expect(gateway.connectionsCount).toBe(3);
    expect(gateway.deliveryRoomsCount).toBe(2);
  });
});
