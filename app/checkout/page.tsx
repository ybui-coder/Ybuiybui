import { prisma } from "@/lib/db";
import CheckoutForm from "@/components/CheckoutForm";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const store = await prisma.store.findFirst();

  if (!store) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center text-foreground/60">
        Cửa hàng hiện chưa sẵn sàng nhận đơn, vui lòng quay lại sau.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-extrabold text-brand-dark">Thông tin đặt hàng</h1>
      <CheckoutForm store={store} />
    </div>
  );
}
