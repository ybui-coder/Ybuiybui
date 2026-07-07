import Link from "next/link";
import { prisma } from "@/lib/db";
import ProductCard from "@/components/ProductCard";

export default async function HomePage() {
  const [featuredProducts, stores] = await Promise.all([
    prisma.product.findMany({ take: 4, orderBy: { name: "asc" } }),
    prisma.store.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <section className="bg-gradient-to-br from-brand to-brand-dark py-20 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 text-center">
          <h1 className="text-4xl font-extrabold sm:text-5xl">Sống trọn từng khoảnh khắc</h1>
          <p className="max-w-xl text-white/90">
            Đặt cà phê, trà và bánh yêu thích của bạn ngay trên website — giao nhanh, theo dõi đơn
            hàng theo thời gian thực từ cửa hàng gần bạn nhất.
          </p>
          <Link
            href="/menu"
            className="rounded-full bg-brand-gold px-8 py-3 font-bold text-brand-dark shadow transition hover:brightness-95"
          >
            Xem thực đơn
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="mb-6 text-2xl font-bold text-brand-dark">Sản phẩm nổi bật</h2>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              slug={product.slug}
              name={product.name}
              price={product.price}
              imageUrl={product.imageUrl}
            />
          ))}
        </div>
      </section>

      <section className="bg-black/[0.03] py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-6 text-2xl font-bold text-brand-dark">Hệ thống cửa hàng</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {stores.map((store) => (
              <div key={store.id} className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
                <p className="font-semibold text-brand-dark">{store.name}</p>
                <p className="mt-1 text-sm text-foreground/70">{store.address}</p>
                <p className="mt-1 text-sm text-foreground/70">{store.phone}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
