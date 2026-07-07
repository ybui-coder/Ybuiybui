"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { formatVnd } from "@/lib/format";

interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string;
}

export default function ProductCard({ id, slug, name, price, imageUrl }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm transition hover:shadow-md">
      <Link href={`/product/${slug}`} className="relative block aspect-square overflow-hidden bg-black/5">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover transition group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={`/product/${slug}`} className="font-semibold text-foreground hover:text-brand">
          {name}
        </Link>
        <p className="mt-auto text-brand font-bold">{formatVnd(price)}</p>
        <button
          onClick={() => addItem({ productId: id, name, slug, price, imageUrl })}
          className="rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}
