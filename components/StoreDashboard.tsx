"use client";

import { useEffect, useRef, useState } from "react";
import { formatVnd } from "@/lib/format";
import type { OrderDto } from "@/lib/types";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang vận chuyển",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
};

interface Toast {
  id: string;
  message: string;
}

export default function StoreDashboard({ storeId }: { storeId: string }) {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const toastIdRef = useRef(0);

  async function loadOrders() {
    const res = await fetch(`/api/orders?storeId=${storeId}`);
    const data = await res.json();
    setOrders(data.orders);
  }

  useEffect(() => {
    loadOrders();

    const source = new EventSource(`/api/stores/${storeId}/events`);
    source.onmessage = (event) => {
      const payload = JSON.parse(event.data) as { message: string };
      const toastId = String(toastIdRef.current++);
      setToasts((prev) => [...prev, { id: toastId, message: payload.message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toastId));
      }, 6000);
      loadOrders();
    };

    return () => source.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  async function handleConfirm(orderId: string) {
    setConfirmingId(orderId);
    await fetch(`/api/orders/${orderId}/confirm`, { method: "POST" });
    await loadOrders();
    setConfirmingId(null);
  }

  const pending = orders.filter((o) => o.status === "PENDING");
  const inProgress = orders.filter((o) => o.status === "CONFIRMED" || o.status === "SHIPPING");
  const done = orders.filter((o) => o.status === "COMPLETED" || o.status === "CANCELLED");

  return (
    <div>
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="rounded-lg bg-brand-dark px-4 py-3 text-sm font-medium text-white shadow-lg"
          >
            🔔 {toast.message}
          </div>
        ))}
      </div>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-bold text-brand-dark">
          Đơn chờ xác nhận ({pending.length})
        </h2>
        {pending.length === 0 && (
          <p className="text-sm text-foreground/50">Chưa có đơn mới.</p>
        )}
        <div className="flex flex-col gap-3">
          {pending.map((order) => (
            <div key={order.id} className="rounded-xl border border-brand-gold/40 bg-brand-gold/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">
                    #{order.id.slice(-6)} — {order.customerName}
                  </p>
                  <p className="text-sm text-foreground/60">{order.deliveryAddress}</p>
                  <p className="mt-1 text-sm font-medium text-brand">{formatVnd(order.totalAmount)}</p>
                </div>
                <button
                  onClick={() => handleConfirm(order.id)}
                  disabled={confirmingId === order.id}
                  className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
                >
                  {confirmingId === order.id ? "Đang xác nhận..." : "Xác nhận đơn"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-bold text-brand-dark">
          Đang xử lý ({inProgress.length})
        </h2>
        <div className="flex flex-col gap-3">
          {inProgress.map((order) => (
            <div key={order.id} className="rounded-xl border border-black/10 bg-white p-4">
              <p className="font-semibold">
                #{order.id.slice(-6)} — {order.customerName}
              </p>
              <p className="text-sm text-foreground/60">
                {STATUS_LABELS[order.status]}
                {order.shipment ? ` · ${order.shipment.status}` : ""}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-brand-dark">Lịch sử ({done.length})</h2>
        <div className="flex flex-col gap-2">
          {done.map((order) => (
            <div key={order.id} className="rounded-lg border border-black/5 bg-black/[0.02] p-3 text-sm">
              #{order.id.slice(-6)} — {order.customerName} — {STATUS_LABELS[order.status]}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
