"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";

const NAV_LINKS = [
  { href: "/", label: "Trang chủ" },
  { href: "/menu", label: "Thực đơn" },
];

export default function Header() {
  const items = useCartStore((state) => state.items);
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);
  useEffect(() => setMenuOpen(false), [pathname]);

  const itemCount = mounted ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  return (
    <header className="sticky top-0 z-50 border-b border-brand-gold/30 bg-brand text-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={menuOpen}
            className="-ml-2 rounded-lg p-2 hover:bg-white/10 sm:hidden"
          >
            <span className="flex w-5 flex-col gap-1">
              <span className="h-0.5 rounded bg-white" />
              <span className="h-0.5 rounded bg-white" />
              <span className="h-0.5 rounded bg-white" />
            </span>
          </button>
          <Link href="/" className="flex items-center rounded-lg bg-white px-2 py-1">
            <Image src="/brand/logo.png" alt="All In Coffee" width={140} height={44} className="h-9 w-auto" priority />
          </Link>
        </div>
        <nav className="hidden gap-6 text-sm font-medium sm:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-brand-gold">
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/cart"
          className="relative rounded-full bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20"
        >
          🛒 Giỏ hàng
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-gold text-xs font-bold text-brand-dark">
              {itemCount}
            </span>
          )}
        </Link>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-white/10 bg-brand-dark px-4 py-3 text-sm font-medium sm:hidden">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-lg px-2 py-2 hover:bg-white/10">
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
