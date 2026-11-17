import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AddressInfo } from 'node:net';
import { io, Socket } from 'socket.io-client';
import { AppModule } from './../src/app.module.js';

const once = <T>(socket: Socket, event: string) =>
  new Promise<T>((resolve) => socket.once(event, resolve));

describe('WebSocket gateway та кімнати (e2e)', () => {
  let app: INestApplication;
  let url: string;
  const sockets: Socket[] = [];

  const connect = async () => {
    const socket = io(url, { transports: ['websocket'], forceNew: true });
    sockets.push(socket);
    await once(socket, 'connect');
    return socket;
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.listen(0);
    const { port } = app.getHttpServer().address() as AddressInfo;
    url = `http://localhost:${port}`;
  });

  afterAll(async () => {
    sockets.forEach((s) => s.disconnect());
    await app.close();
  });

  it('ping → pong і broadcast для всіх клієнтів', async () => {
    const a = await connect();
    const b = await connect();

    const pong = once<{ timestamp: string }>(a, 'pong');
    a.emit('ping');
    expect((await pong).timestamp).toBeTruthy();

    const alertA = once<{ message: string }>(a, 'globalAlert');
    const alertB = once<{ message: string }>(b, 'globalAlert');
    a.emit('broadcastNotification', 'Кухня працює до 23:00');
    expect((await alertA).message).toBe('Кухня працює до 23:00');
    expect((await alertB).message).toBe('Кухня працює до 23:00');
  });

  it('courierLocationUpdated отримує лише підписник кімнати', async () => {
    const subscriber = await connect();
    const outsider = await connect();
    const courier = await connect();

    const joined = once(subscriber, 'joined');
    subscriber.emit('joinRoom', { roomId: 'delivery_555' });
    await joined;

    const outsiderSpy = vi.fn();
    outsider.on('courierLocationUpdated', outsiderSpy);
    const received = once<{ orderId: string; lat: number }>(
      subscriber,
      'courierLocationUpdated',
    );
    const ack = await courier.emitWithAck('updateCourierLocation', {
      orderId: '555',
      lat: 50.45,
      lng: 30.52,
    });
    expect(ack).toEqual({ status: 'sent', roomId: 'delivery_555' });
    expect(await received).toMatchObject({ orderId: '555', lat: 50.45 });
    await new Promise((r) => setTimeout(r, 200));
    expect(outsiderSpy).not.toHaveBeenCalled();

    const error = once<{ message: string }>(subscriber, 'exception');
    subscriber.emit('joinRoom', { roomId: 'kitchen' });
    expect((await error).message).toContain('delivery_<orderId>');
  });
});
