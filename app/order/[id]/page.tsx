"use client";

import { use, useEffect, useState } from "react";
import { formatVnd } from "@/lib/format";
import type { OrderDto } from "@/lib/types";
import OrderStatusTimeline from "@/components/OrderStatusTimeline";
import PaymentQrCard from "@/components/PaymentQrCard";

const SHIPMENT_LABELS: Record<string, string> = {
  BOOKED: "Đã đặt shipper",
  PICKED_UP: "Shipper đã lấy hàng",
  DELIVERING: "Đang giao hàng",
  DELIVERED: "Đã giao thành công",
};

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const res = await fetch(`/api/orders/${id}`);
      if (cancelled) return;
      if (!res.ok) {
        setNotFound(true);
        return;
      }
      const data = await res.json();
      setOrder(data.order);
    }

    load();
    const interval = setInterval(load, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [id]);

  if (notFound) {
    return <p className="mx-auto max-w-2xl px-4 py-20 text-center">Không tìm thấy đơn hàng.</p>;
  }

  if (!order) {
    return <p className="mx-auto max-w-2xl px-4 py-20 text-center text-foreground/60">Đang tải...</p>;
  }

  const isPaid = order.payment?.status === "PAID";

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-extrabold text-brand-dark">Đơn hàng #{order.id.slice(-6)}</h1>
      <p className="mt-1 text-sm text-foreground/60">Đặt tại {order.store.name}</p>

      <div className="mt-8 rounded-xl border border-black/10 bg-white p-6">
        <OrderStatusTimeline status={order.status} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-black/10 bg-white p-5">
          <p className="text-xs text-foreground/60">Giá trị đơn hàng</p>
          <p className="mt-1 text-xl font-bold text-brand">{formatVnd(order.totalAmount)}</p>
        </div>
        <div className="rounded-xl border border-black/10 bg-white p-5">
          <p className="text-xs text-foreground/60">Hình thức thanh toán</p>
          <p className="mt-1 text-xl font-bold text-brand-dark">
            {order.payment?.method === "COD" ? "COD" : "Online"}
          </p>
          <p className={`text-xs font-medium ${isPaid ? "text-green-600" : "text-amber-600"}`}>
            {isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
          </p>
        </div>
      </div>

      {order.payment?.method === "ONLINE" && !isPaid && (
        <PaymentQrCard orderId={order.id} amount={order.totalAmount} />
      )}

      {order.shipment && (
        <div className="mt-6 rounded-xl border border-black/10 bg-white p-6">
          <p className="font-semibold text-brand-dark">Thông tin vận chuyển</p>
          <p className="mt-2 text-sm">
            Trạng thái: <b>{SHIPMENT_LABELS[order.shipment.status] ?? order.shipment.status}</b>
          </p>
          <p className="text-sm text-foreground/70">Mã vận đơn: {order.shipment.trackingCode}</p>
          <p className="text-sm text-foreground/70">Shipper: {order.shipment.shipperName}</p>
        </div>
      )}

      <div className="mt-6 rounded-xl border border-black/10 bg-white p-6">
        <p className="font-semibold text-brand-dark">Chi tiết đơn hàng</p>
        <div className="mt-3 flex flex-col gap-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.product.name} x{item.quantity}
              </span>
              <span>{formatVnd(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-1.5 border-t border-black/10 pt-3 text-sm">
          <div className="flex justify-between text-foreground/70">
            <span>Tạm tính</span>
            <span>{formatVnd(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-foreground/70">
            <span>Phí ship</span>
            <span>{formatVnd(order.shippingFee)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-green-700">
              <span>Giảm giá {order.voucher ? `(${order.voucher.code})` : ""}</span>
              <span>-{formatVnd(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-black/10 pt-2 text-base font-bold">
            <span>Tổng cộng</span>
            <span className="text-brand">{formatVnd(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-black/10 bg-white p-6 text-sm">
        <p className="font-semibold text-brand-dark">Giao đến</p>
        <p className="mt-1">{order.customerName} — {order.customerPhone}</p>
        <p>{order.deliveryAddress}</p>
      </div>
    </div>
  );
}
