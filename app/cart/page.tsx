"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { formatVnd } from "@/lib/format";

export default function CartPage() {
  const { items, setQuantity, removeItem } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-brand-dark">Giỏ hàng của bạn đang trống</h1>
        <Link href="/menu" className="mt-6 inline-block rounded-full bg-brand px-6 py-3 font-semibold text-white">
          Xem thực đơn
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-extrabold text-brand-dark">Giỏ hàng</h1>
      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center gap-4 rounded-xl border border-black/10 bg-white p-4"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-black/5">
              <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="64px" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-brand">{formatVnd(item.price)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(item.productId, item.quantity - 1)}
                className="h-8 w-8 rounded border border-black/10 font-bold hover:bg-black/5"
              >
                −
              </button>
              <span className="w-6 text-center">{item.quantity}</span>
              <button
                onClick={() => setQuantity(item.productId, item.quantity + 1)}
                className="h-8 w-8 rounded border border-black/10 font-bold hover:bg-black/5"
              >
                +
              </button>
            </div>
            <button
              onClick={() => removeItem(item.productId)}
              className="text-sm text-foreground/50 hover:text-red-600"
            >
              Xóa
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-black/10 pt-6">
        <p className="text-lg font-bold">Tạm tính</p>
        <p className="text-2xl font-bold text-brand">{formatVnd(total)}</p>
      </div>
      <p className="text-right text-xs text-foreground/50">Chưa gồm phí ship, sẽ tính ở bước tiếp theo</p>

      <Link
        href="/checkout"
        className="mt-6 block w-full rounded-lg bg-brand py-3 text-center font-semibold text-white hover:bg-brand-dark"
      >
        Tiến hành đặt hàng
      </Link>
    </div>
  );
}
