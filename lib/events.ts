import { EventEmitter } from "node:events";

export type StoreEvent =
  | { type: "new_order"; orderId: string; message: string }
  | { type: "order_update"; orderId: string; message: string };

const globalForEvents = globalThis as unknown as {
  storeEventBus: EventEmitter | undefined;
};

export const storeEventBus = globalForEvents.storeEventBus ?? new EventEmitter();
storeEventBus.setMaxListeners(0);

if (process.env.NODE_ENV !== "production") {
  globalForEvents.storeEventBus = storeEventBus;
}

export function emitToStore(storeId: string, event: StoreEvent) {
  storeEventBus.emit(`store:${storeId}`, event);
}

export function subscribeToStore(
  storeId: string,
  listener: (event: StoreEvent) => void,
) {
  const channel = `store:${storeId}`;
  storeEventBus.on(channel, listener);
  return () => storeEventBus.off(channel, listener);
}
