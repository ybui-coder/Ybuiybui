import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import StoreDashboard from "@/components/StoreDashboard";

export default async function StoreDashboardPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;
  const store = await prisma.store.findUnique({ where: { id: storeId } });

  if (!store) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-extrabold text-brand-dark">{store.name}</h1>
      <p className="mb-6 text-sm text-foreground/60">{store.address}</p>
      <StoreDashboard storeId={store.id} />
    </div>
  );
}
