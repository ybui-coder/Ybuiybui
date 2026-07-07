import { NextResponse } from "next/server";
import { confirmPayment } from "@/lib/payment";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const payment = await confirmPayment(id);
    return NextResponse.json({ payment });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lỗi xác nhận thanh toán";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
