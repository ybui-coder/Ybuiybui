import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { bookShipment } from "@/lib/mock-shipping";
import { emitToStore } from "@/lib/events";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });
  }
  if (order.status !== "PENDING") {
    return NextResponse.json({ error: "Đơn hàng đã được xử lý" }, { status: 400 });
  }

  await prisma.order.update({ where: { id }, data: { status: "CONFIRMED" } });
  await bookShipment(id);
  const updatedOrder = await prisma.order.update({
    where: { id },
    data: { status: "SHIPPING" },
    include: { shipment: true },
  });

  emitToStore(order.storeId, {
    type: "order_update",
    orderId: id,
    message: `Đơn #${id.slice(-6)} đã xác nhận, đang chờ vận chuyển`,
  });

  return NextResponse.json({ order: updatedOrder });
}
