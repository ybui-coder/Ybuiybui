import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const vouchers = await prisma.voucher.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    select: { code: true, description: true, discountType: true, discountValue: true },
  });

  return NextResponse.json({ vouchers });
}
