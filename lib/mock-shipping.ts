import { prisma } from "@/lib/db";
import { emitToStore } from "@/lib/events";

const SHIPMENT_FLOW = ["BOOKED", "PICKED_UP", "DELIVERING", "DELIVERED"] as const;

const SHIPPER_NAMES = [
  "Nguyễn Văn An",
  "Trần Thị Bình",
  "Lê Hoàng Cường",
  "Phạm Minh Đức",
  "Vũ Thị Hoa",
];

const AUTO_ADVANCE_DELAY_MS = 8000;

function randomTrackingCode() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `GHN${rand}`;
}

function randomShipper() {
  return SHIPPER_NAMES[Math.floor(Math.random() * SHIPPER_NAMES.length)];
}

export async function bookShipment(orderId: string) {
  const shipment = await prisma.shipment.create({
    data: {
      orderId,
      shipperName: randomShipper(),
      trackingCode: randomTrackingCode(),
      status: "BOOKED",
    },
  });

  scheduleAutoAdvance(orderId);

  return shipment;
}

function scheduleAutoAdvance(orderId: string) {
  setTimeout(async () => {
    try {
      const result = await advanceShipment(orderId);
      if (result && result.shipment.status !== "DELIVERED") {
        scheduleAutoAdvance(orderId);
      }
    } catch {
      // order/shipment may no longer exist (e.g. cancelled) - stop the chain silently
    }
  }, AUTO_ADVANCE_DELAY_MS);
}

export async function advanceShipment(orderId: string) {
  const shipment = await prisma.shipment.findUnique({ where: { orderId } });
  if (!shipment) return null;

  const currentIndex = SHIPMENT_FLOW.indexOf(
    shipment.status as (typeof SHIPMENT_FLOW)[number],
  );
  if (currentIndex === SHIPMENT_FLOW.length - 1) {
    return { shipment };
  }

  const nextStatus = SHIPMENT_FLOW[currentIndex + 1];
  const isDelivered = nextStatus === "DELIVERED";

  const updatedShipment = await prisma.shipment.update({
    where: { orderId },
    data: {
      status: nextStatus,
      deliveredAt: isDelivered ? new Date() : undefined,
    },
  });

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: isDelivered ? "COMPLETED" : "SHIPPING" },
    include: { payment: true },
  });

  if (isDelivered && order.payment?.method === "COD" && order.payment.status !== "PAID") {
    await prisma.payment.update({
      where: { orderId },
      data: { status: "PAID", paidAt: new Date() },
    });
  }

  emitToStore(order.storeId, {
    type: "order_update",
    orderId,
    message: isDelivered
      ? `Đơn #${orderId.slice(-6)} đã giao thành công`
      : `Đơn #${orderId.slice(-6)} đang vận chuyển: ${nextStatus}`,
  });

  return { shipment: updatedShipment };
}
