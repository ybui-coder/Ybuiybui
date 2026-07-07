"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { formatVnd } from "@/lib/format";
import { SHIPPING_FEE, VN_PHONE_REGEX, isValidAddress } from "@/lib/pricing";
import type { VoucherDto } from "@/lib/types";

interface Store {
  id: string;
  name: string;
  address: string;
}

interface AppliedVoucher {
  code: string;
  description: string;
  discountAmount: number;
}

export default function CheckoutForm({ store }: { store: Store }) {
  const router = useRouter();
  const { items, clear } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "ONLINE">("COD");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ phone?: string; address?: string }>({});

  const [availableVouchers, setAvailableVouchers] = useState<VoucherDto[]>([]);
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<AppliedVoucher | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [applyingVoucher, setApplyingVoucher] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    fetch("/api/vouchers")
      .then((res) => res.json())
      .then((data) => setAvailableVouchers(data.vouchers ?? []))
      .catch(() => setAvailableVouchers([]));
  }, []);

  if (!mounted) return null;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = appliedVoucher?.discountAmount ?? 0;
  const total = Math.max(subtotal + SHIPPING_FEE - discountAmount, 0);

  if (items.length === 0) {
    return <p className="text-foreground/70">Giỏ hàng của bạn đang trống.</p>;
  }

  async function handleApplyVoucher(code: string) {
    if (!code.trim()) return;
    setApplyingVoucher(true);
    setVoucherError(null);

    try {
      const res = await fetch("/api/vouchers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setVoucherError(data.error ?? "Mã giảm giá không hợp lệ");
        setAppliedVoucher(null);
        return;
      }
      setAppliedVoucher({
        code: data.voucher.code,
        description: data.voucher.description,
        discountAmount: data.discountAmount,
      });
      setVoucherCode(data.voucher.code);
    } catch {
      setVoucherError("Không thể kiểm tra mã giảm giá, vui lòng thử lại");
    } finally {
      setApplyingVoucher(false);
    }
  }

  function handleRemoveVoucher() {
    setAppliedVoucher(null);
    setVoucherCode("");
    setVoucherError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const errors: { phone?: string; address?: string } = {};
    if (!VN_PHONE_REGEX.test(customerPhone.trim())) {
      errors.phone = "Số điện thoại không hợp lệ (VD: 0912345678)";
    }
    if (!isValidAddress(deliveryAddress)) {
      errors.address = "Vui lòng nhập địa chỉ cụ thể (số nhà, tên đường...)";
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          deliveryAddress,
          storeId: store.id,
          paymentMethod,
          voucherCode: appliedVoucher?.code,
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
          placeholder="VD: 0912345678"
          className="w-full rounded-lg border border-black/15 px-3 py-2 focus:border-brand focus:outline-none"
        />
        {fieldErrors.phone && <p className="mt-1 text-sm text-red-600">{fieldErrors.phone}</p>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Địa chỉ giao hàng</label>
        <input
          required
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
          placeholder="Số nhà, tên đường, phường/quận..."
          className="w-full rounded-lg border border-black/15 px-3 py-2 focus:border-brand focus:outline-none"
        />
        {fieldErrors.address && <p className="mt-1 text-sm text-red-600">{fieldErrors.address}</p>}
      </div>
      <div className="rounded-lg bg-black/[0.03] p-3 text-sm">
        <p className="font-medium text-brand-dark">Giao từ {store.name}</p>
        <p className="text-foreground/60">{store.address}</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Mã giảm giá</label>
        {appliedVoucher ? (
          <div className="flex items-center justify-between rounded-lg border border-green-600/30 bg-green-600/5 px-3 py-2">
            <div>
              <p className="text-sm font-semibold text-green-700">{appliedVoucher.code}</p>
              <p className="text-xs text-foreground/60">{appliedVoucher.description}</p>
            </div>
            <button
              type="button"
              onClick={handleRemoveVoucher}
              className="text-sm text-foreground/50 hover:text-red-600"
            >
              Bỏ áp dụng
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
              placeholder="Nhập mã giảm giá"
              className="flex-1 rounded-lg border border-black/15 px-3 py-2 focus:border-brand focus:outline-none"
            />
            <button
              type="button"
              disabled={applyingVoucher || !voucherCode.trim()}
              onClick={() => handleApplyVoucher(voucherCode)}
              className="rounded-lg border-2 border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-brand/5 disabled:opacity-60"
            >
              {applyingVoucher ? "Đang kiểm tra..." : "Áp dụng"}
            </button>
          </div>
        )}
        {voucherError && <p className="mt-1 text-sm text-red-600">{voucherError}</p>}
        {!appliedVoucher && availableVouchers.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {availableVouchers.map((voucher) => (
              <button
                type="button"
                key={voucher.code}
                onClick={() => handleApplyVoucher(voucher.code)}
                title={voucher.description}
                className="rounded-full border border-brand-gold/50 bg-brand-gold/10 px-3 py-1 text-xs font-medium text-brand-dark hover:bg-brand-gold/20"
              >
                {voucher.code}
              </button>
            ))}
          </div>
        )}
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
            Chuyển khoản online (QR)
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-black/10 pt-4 text-sm">
        <div className="flex justify-between text-foreground/70">
          <span>Tạm tính</span>
          <span>{formatVnd(subtotal)}</span>
        </div>
        <div className="flex justify-between text-foreground/70">
          <span>Phí ship</span>
          <span>{formatVnd(SHIPPING_FEE)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-green-700">
            <span>Giảm giá</span>
            <span>-{formatVnd(discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold">
          <span>Tổng cộng</span>
          <span className="text-brand">{formatVnd(total)}</span>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-brand py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
      >
        {submitting ? "Đang xử lý..." : "Đặt hàng"}
      </button>
    </form>
  );
}
