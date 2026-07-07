import { NextResponse } from "next/server";
import { advanceShipment } from "@/lib/mock-shipping";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const result = await advanceShipment(id);
  if (!result) {
    return NextResponse.json({ error: "Đơn hàng chưa có thông tin vận chuyển" }, { status: 400 });
  }

  return NextResponse.json({ shipment: result.shipment });
}
