import { MessageEvent } from '@nestjs/common';
import {
  NotificationsController,
  SSE_INTERVAL_MS,
} from './notifications.controller.js';
import { EventsGateway } from './events.gateway.js';

describe('NotificationsController (SSE)', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('кожні 5 секунд віддає подію serverStatus із системними даними', () => {
    vi.useFakeTimers();
    const gateway = { connectionsCount: 2, deliveryRoomsCount: 1 };
    const controller = new NotificationsController(
      gateway as unknown as EventsGateway,
    );
    const events: MessageEvent[] = [];
    const sub = controller.stream().subscribe((e) => events.push(e));

    vi.advanceTimersByTime(SSE_INTERVAL_MS - 1);
    expect(events).toHaveLength(0);
    vi.advanceTimersByTime(1);
    vi.advanceTimersByTime(SSE_INTERVAL_MS);
    sub.unsubscribe();

    expect(events).toHaveLength(2);
    expect(events[1]).toMatchObject({
      id: '1',
      type: 'serverStatus',
      data: {
        tick: 1,
        status: 'online',
        activeConnections: 2,
        activeDeliveryRooms: 1,
      },
    });
  });
});
