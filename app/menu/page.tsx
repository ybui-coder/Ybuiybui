import { prisma } from "@/lib/db";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const categories = await prisma.category.findMany({
    include: { products: { orderBy: { name: "asc" } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-10 text-3xl font-extrabold text-brand-dark">Thực đơn</h1>
      {categories.map((category) => (
        <section key={category.id} className="mb-12">
          <h2 className="mb-5 border-b border-brand-gold/40 pb-2 text-xl font-bold text-brand-dark">
            {category.name}
          </h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {category.products.map((product) => (
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
      ))}
    </div>
  );
}
