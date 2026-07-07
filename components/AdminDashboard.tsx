"use client";

import { useEffect, useMemo, useState } from "react";
import { formatVnd } from "@/lib/format";
import type { OrderDto } from "@/lib/types";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang vận chuyển",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [storeFilter, setStoreFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [advancingId, setAdvancingId] = useState<string | null>(null);

  async function loadOrders() {
    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrders(data.orders);
  }

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 4000);
    return () => clearInterval(interval);
  }, []);

  const stores = useMemo(() => {
    const map = new Map(orders.map((o) => [o.store.id, o.store.name]));
    return Array.from(map.entries());
  }, [orders]);

  const filteredOrders = orders.filter(
    (o) =>
      (storeFilter === "ALL" || o.storeId === storeFilter) &&
      (statusFilter === "ALL" || o.status === statusFilter),
  );

  const reconciliation = useMemo(() => {
    let codPaid = 0;
    let codPending = 0;
    let onlinePaid = 0;
    let onlinePending = 0;

    for (const order of orders) {
      if (!order.payment) continue;
      if (order.payment.method === "COD") {
        if (order.payment.status === "PAID") codPaid += order.payment.amount;
        else codPending += order.payment.amount;
      } else {
        if (order.payment.status === "PAID") onlinePaid += order.payment.amount;
        else onlinePending += order.payment.amount;
      }
    }

    return { codPaid, codPending, onlinePaid, onlinePending };
  }, [orders]);

  async function handleAdvance(orderId: string) {
    setAdvancingId(orderId);
    await fetch(`/api/orders/${orderId}/advance-shipment`, { method: "POST" });
    await loadOrders();
    setAdvancingId(null);
  }

  return (
    <div>
      <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="COD đã thu" value={reconciliation.codPaid} tone="green" />
        <SummaryCard label="COD chưa thu (đang giao)" value={reconciliation.codPending} tone="amber" />
        <SummaryCard label="Online đã thanh toán" value={reconciliation.onlinePaid} tone="green" />
        <SummaryCard label="Online chờ thanh toán" value={reconciliation.onlinePending} tone="amber" />
      </section>

      <section className="mb-6 flex flex-wrap gap-3">
        <select
          value={storeFilter}
          onChange={(e) => setStoreFilter(e.target.value)}
          className="rounded-lg border border-black/15 px-3 py-2 text-sm"
        >
          <option value="ALL">Tất cả cửa hàng</option>
          {stores.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-black/15 px-3 py-2 text-sm"
        >
          <option value="ALL">Tất cả trạng thái</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </section>

      <div className="overflow-x-auto rounded-xl border border-black/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/[0.03] text-xs uppercase text-foreground/50">
            <tr>
              <th className="px-4 py-3">Mã đơn</th>
              <th className="px-4 py-3">Khách hàng</th>
              <th className="px-4 py-3">Cửa hàng</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Thanh toán</th>
              <th className="px-4 py-3">Vận chuyển</th>
              <th className="px-4 py-3">Tổng tiền</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className="border-t border-black/5">
                <td className="px-4 py-3 font-medium">#{order.id.slice(-6)}</td>
                <td className="px-4 py-3">{order.customerName}</td>
                <td className="px-4 py-3">{order.store.name}</td>
                <td className="px-4 py-3">{STATUS_LABELS[order.status]}</td>
                <td className="px-4 py-3">
                  {order.payment?.method === "COD" ? "COD" : "Online"} —{" "}
                  <span
                    className={
                      order.payment?.status === "PAID" ? "font-semibold text-green-600" : "text-amber-600"
                    }
                  >
                    {order.payment?.status === "PAID" ? "Đã thu" : "Chưa thu"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {order.shipment ? (
                    <div>
                      <p>{order.shipment.status}</p>
                      <p className="text-xs text-foreground/50">
                        {order.shipment.trackingCode} · {order.shipment.shipperName}
                      </p>
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 font-semibold text-brand">{formatVnd(order.totalAmount)}</td>
                <td className="px-4 py-3">
                  {order.shipment && order.shipment.status !== "DELIVERED" && (
                    <button
                      onClick={() => handleAdvance(order.id)}
                      disabled={advancingId === order.id}
                      className="rounded-lg bg-brand-dark px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                    >
                      {advancingId === order.id ? "..." : "Tiến triển ship"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-foreground/50">
                  Không có đơn hàng phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "green" | "amber";
}) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-5">
      <p className="text-sm text-foreground/60">{label}</p>
      <p className={`mt-2 text-xl font-bold ${tone === "green" ? "text-green-600" : "text-amber-600"}`}>
        {formatVnd(value)}
      </p>
    </div>
  );
}
