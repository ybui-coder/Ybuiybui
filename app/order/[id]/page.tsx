"use client";

import { use, useEffect, useState } from "react";
import { formatVnd } from "@/lib/format";
import type { OrderDto } from "@/lib/types";
import OrderStatusTimeline from "@/components/OrderStatusTimeline";

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
  const [confirmingPayment, setConfirmingPayment] = useState(false);

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

  async function handleConfirmPayment() {
    setConfirmingPayment(true);
    await fetch(`/api/orders/${id}/confirm-payment`, { method: "POST" });
    const res = await fetch(`/api/orders/${id}`);
    const data = await res.json();
    setOrder(data.order);
    setConfirmingPayment(false);
  }

  if (notFound) {
    return <p className="mx-auto max-w-2xl px-4 py-20 text-center">Không tìm thấy đơn hàng.</p>;
  }

  if (!order) {
    return <p className="mx-auto max-w-2xl px-4 py-20 text-center text-foreground/60">Đang tải...</p>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-extrabold text-brand-dark">Đơn hàng #{order.id.slice(-6)}</h1>
      <p className="mt-1 text-sm text-foreground/60">Đặt tại {order.store.name}</p>

      <div className="mt-8 rounded-xl border border-black/10 bg-white p-6">
        <OrderStatusTimeline status={order.status} />
      </div>

      {order.payment?.method === "ONLINE" && order.payment.status !== "PAID" && (
        <div className="mt-6 rounded-xl border border-brand-gold/40 bg-brand-gold/10 p-5">
          <p className="font-semibold text-brand-dark">Thanh toán online (giả lập)</p>
          <p className="mt-1 text-sm text-foreground/70">
            Đây là trang mô phỏng cổng thanh toán. Bấm nút bên dưới để giả lập webhook xác nhận đã
            thanh toán thành công.
          </p>
          <button
            onClick={handleConfirmPayment}
            disabled={confirmingPayment}
            className="mt-4 rounded-lg bg-brand-gold px-5 py-2 font-semibold text-brand-dark disabled:opacity-60"
          >
            {confirmingPayment ? "Đang xử lý..." : "Xác nhận đã thanh toán"}
          </button>
        </div>
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
        <div className="mt-4 flex justify-between border-t border-black/10 pt-3 font-bold">
          <span>Tổng cộng</span>
          <span className="text-brand">{formatVnd(order.totalAmount)}</span>
        </div>
        <p className="mt-3 text-sm text-foreground/60">
          Thanh toán: {order.payment?.method === "COD" ? "Khi nhận hàng" : "Online"} —{" "}
          <span className={order.payment?.status === "PAID" ? "text-green-600 font-semibold" : ""}>
            {order.payment?.status === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}
          </span>
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-black/10 bg-white p-6 text-sm">
        <p className="font-semibold text-brand-dark">Giao đến</p>
        <p className="mt-1">{order.customerName} — {order.customerPhone}</p>
        <p>{order.deliveryAddress}</p>
      </div>
    </div>
  );
}
