import { prisma } from "@/lib/db";

function randomTransactionRef() {
  return `MOCKPAY${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

export async function confirmMockPayment(orderId: string) {
  const payment = await prisma.payment.findUnique({ where: { orderId } });
  if (!payment) throw new Error("Payment not found");
  if (payment.method !== "ONLINE") {
    throw new Error("Chỉ đơn thanh toán online mới cần xác nhận thủ công");
  }
  if (payment.status === "PAID") return payment;

  return prisma.payment.update({
    where: { orderId },
    data: {
      status: "PAID",
      paidAt: new Date(),
      transactionRef: randomTransactionRef(),
    },
  });
}
