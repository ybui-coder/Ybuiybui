"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";

interface AddToCartControlProps {
  productId: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string;
}

export default function AddToCartControl({
  productId,
  slug,
  name,
  price,
  imageUrl,
}: AddToCartControlProps) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="h-10 w-10 rounded-lg border border-black/10 font-bold hover:bg-black/5"
        >
          −
        </button>
        <span className="w-8 text-center text-lg font-semibold">{quantity}</span>
        <button
          onClick={() => setQuantity((q) => q + 1)}
          className="h-10 w-10 rounded-lg border border-black/10 font-bold hover:bg-black/5"
        >
          +
        </button>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => addItem({ productId, name, slug, price, imageUrl }, quantity)}
          className="flex-1 rounded-lg border-2 border-brand px-4 py-3 font-semibold text-brand transition hover:bg-brand/5"
        >
          Thêm vào giỏ
        </button>
        <button
          onClick={() => {
            addItem({ productId, name, slug, price, imageUrl }, quantity);
            router.push("/cart");
          }}
          className="flex-1 rounded-lg bg-brand px-4 py-3 font-semibold text-white transition hover:bg-brand-dark"
        >
          Đặt ngay
        </button>
      </div>
    </div>
  );
}
