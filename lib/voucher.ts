import { prisma } from "@/lib/db";

export interface VoucherResult {
  voucher: { id: string; code: string; description: string };
  discountAmount: number;
}

export async function resolveVoucher(
  code: string,
  subtotal: number,
): Promise<VoucherResult | { error: string }> {
  const voucher = await prisma.voucher.findUnique({
    where: { code: code.trim().toUpperCase() },
  });

  if (!voucher || !voucher.isActive) {
    return { error: "Mã giảm giá không hợp lệ hoặc đã hết hạn" };
  }

  const rawDiscount =
    voucher.discountType === "PERCENT"
      ? Math.round((subtotal * voucher.discountValue) / 100)
      : voucher.discountValue;

  const discountAmount = Math.min(rawDiscount, subtotal);

  return {
    voucher: { id: voucher.id, code: voucher.code, description: voucher.description },
    discountAmount,
  };
}
