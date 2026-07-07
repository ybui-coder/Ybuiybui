import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function StoreListPage() {
  const stores = await prisma.store.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-extrabold text-brand-dark">Đăng nhập nhân viên cửa hàng</h1>
      <p className="mb-8 text-sm text-foreground/60">
        Chọn cửa hàng để xem đơn hàng mới và xác nhận vận chuyển (demo: chưa yêu cầu đăng nhập).
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {stores.map((store) => (
          <Link
            key={store.id}
            href={`/store/${store.id}`}
            className="rounded-xl border border-black/10 bg-white p-5 shadow-sm transition hover:border-brand"
          >
            <p className="font-semibold text-brand-dark">{store.name}</p>
            <p className="mt-1 text-sm text-foreground/70">{store.address}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
