import { NextRequest, NextResponse } from "next/server";
import { resolveVoucher } from "@/lib/voucher";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { code?: string; subtotal?: number };

  if (!body.code?.trim() || !Number.isInteger(body.subtotal) || body.subtotal! < 0) {
    return NextResponse.json({ error: "Thiếu thông tin mã giảm giá" }, { status: 400 });
  }

  const result = await resolveVoucher(body.code, body.subtotal!);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
