import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { formatVnd } from "@/lib/format";
import AddToCartControl from "@/components/AddToCartControl";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="grid gap-10 sm:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-black/5">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        </div>
        <div>
          <p className="text-sm font-medium text-brand">{product.category.name}</p>
          <h1 className="mt-1 text-3xl font-extrabold text-brand-dark">{product.name}</h1>
          <p className="mt-3 text-foreground/70">{product.description}</p>
          <p className="mt-6 text-2xl font-bold text-brand">{formatVnd(product.price)}</p>
          <div className="mt-8">
            <AddToCartControl
              productId={product.id}
              slug={product.slug}
              name={product.name}
              price={product.price}
              imageUrl={product.imageUrl}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
