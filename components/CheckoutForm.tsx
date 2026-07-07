"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { formatVnd } from "@/lib/format";

interface Store {
  id: string;
  name: string;
  address: string;
}

export default function CheckoutForm({ stores }: { stores: Store[] }) {
  const router = useRouter();
  const { items, clear } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [storeId, setStoreId] = useState(stores[0]?.id ?? "");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "ONLINE">("COD");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (items.length === 0) {
    return <p className="text-foreground/70">Giỏ hàng của bạn đang trống.</p>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          deliveryAddress,
          storeId,
          paymentMethod,
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Đặt hàng thất bại, vui lòng thử lại");
        setSubmitting(false);
        return;
      }

      clear();
      router.push(`/order/${data.order.id}`);
    } catch {
      setError("Không thể kết nối máy chủ, vui lòng thử lại");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="mb-1 block text-sm font-medium">Họ tên</label>
        <input
          required
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="w-full rounded-lg border border-black/15 px-3 py-2 focus:border-brand focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Số điện thoại</label>
        <input
          required
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          className="w-full rounded-lg border border-black/15 px-3 py-2 focus:border-brand focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Địa chỉ giao hàng</label>
        <input
          required
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
          className="w-full rounded-lg border border-black/15 px-3 py-2 focus:border-brand focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Cửa hàng nhận đơn (hub sẽ tự định tuyến)</label>
        <select
          value={storeId}
          onChange={(e) => setStoreId(e.target.value)}
          className="w-full rounded-lg border border-black/15 px-3 py-2 focus:border-brand focus:outline-none"
        >
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name} — {store.address}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Phương thức thanh toán</label>
        <div className="flex gap-4">
          <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-black/15 p-3 has-checked:border-brand has-checked:bg-brand/5">
            <input
              type="radio"
              checked={paymentMethod === "COD"}
              onChange={() => setPaymentMethod("COD")}
            />
            Thanh toán khi nhận hàng (COD)
          </label>
          <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-black/15 p-3 has-checked:border-brand has-checked:bg-brand/5">
            <input
              type="radio"
              checked={paymentMethod === "ONLINE"}
              onChange={() => setPaymentMethod("ONLINE")}
            />
            Thanh toán online (giả lập)
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-black/10 pt-4">
        <p className="font-semibold">Tổng cộng</p>
        <p className="text-xl font-bold text-brand">{formatVnd(total)}</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting || !storeId}
        className="rounded-lg bg-brand py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
      >
        {submitting ? "Đang xử lý..." : "Đặt hàng"}
      </button>
    </form>
  );
}
