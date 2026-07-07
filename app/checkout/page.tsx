import { prisma } from "@/lib/db";
import CheckoutForm from "@/components/CheckoutForm";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const stores = await prisma.store.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-extrabold text-brand-dark">Thông tin đặt hàng</h1>
      <CheckoutForm stores={stores} />
    </div>
  );
}
