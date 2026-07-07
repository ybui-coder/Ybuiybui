import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { emitToStore } from "@/lib/events";
import { sendOrderNotificationEmail } from "@/lib/email";
import { SHIPPING_FEE, VN_PHONE_REGEX, isValidAddress } from "@/lib/pricing";
import { resolveVoucher } from "@/lib/voucher";

const ORDER_INCLUDE = {
  items: { include: { product: true } },
  payment: true,
  shipment: true,
  store: true,
  voucher: true,
} as const;

export async function GET(request: NextRequest) {
  const storeId = request.nextUrl.searchParams.get("storeId") ?? undefined;

  const orders = await prisma.order.findMany({
    where: storeId ? { storeId } : undefined,
    include: ORDER_INCLUDE,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}

interface CreateOrderItem {
  productId: string;
  quantity: number;
}

interface CreateOrderBody {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  storeId: string;
  paymentMethod: "COD" | "ONLINE";
  items: CreateOrderItem[];
  voucherCode?: string;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as CreateOrderBody;

  if (
    !body.customerName?.trim() ||
    !body.customerPhone?.trim() ||
    !body.deliveryAddress?.trim() ||
    !body.storeId ||
    !Array.isArray(body.items) ||
    body.items.length === 0
  ) {
    return NextResponse.json({ error: "Thiếu thông tin đơn hàng" }, { status: 400 });
  }

  if (!VN_PHONE_REGEX.test(body.customerPhone.trim())) {
    return NextResponse.json(
      { error: "Số điện thoại không hợp lệ (cần đúng định dạng số di động Việt Nam)" },
      { status: 400 },
    );
  }

  if (!isValidAddress(body.deliveryAddress)) {
    return NextResponse.json(
      { error: "Vui lòng nhập địa chỉ cụ thể (số nhà, tên đường...)" },
      { status: 400 },
    );
  }

  if (body.paymentMethod !== "COD" && body.paymentMethod !== "ONLINE") {
    return NextResponse.json({ error: "Phương thức thanh toán không hợp lệ" }, { status: 400 });
  }

  const store = await prisma.store.findUnique({ where: { id: body.storeId } });
  if (!store) {
    return NextResponse.json({ error: "Cửa hàng không tồn tại" }, { status: 400 });
  }

  const productIds = body.items.map((item) => item.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const productById = new Map(products.map((product) => [product.id, product]));

  for (const item of body.items) {
    const product = productById.get(item.productId);
    if (!product || !Number.isInteger(item.quantity) || item.quantity < 1) {
      return NextResponse.json({ error: "Sản phẩm không hợp lệ" }, { status: 400 });
    }
  }

  const subtotal = body.items.reduce((sum, item) => {
    const product = productById.get(item.productId)!;
    return sum + product.price * item.quantity;
  }, 0);

  let discountAmount = 0;
  let voucherId: string | null = null;

  if (body.voucherCode?.trim()) {
    const result = await resolveVoucher(body.voucherCode, subtotal);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    discountAmount = result.discountAmount;
    voucherId = result.voucher.id;
  }

  const totalAmount = Math.max(subtotal + SHIPPING_FEE - discountAmount, 0);

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        customerName: body.customerName.trim(),
        customerPhone: body.customerPhone.trim(),
        deliveryAddress: body.deliveryAddress.trim(),
        storeId: body.storeId,
        subtotal,
        shippingFee: SHIPPING_FEE,
        discountAmount,
        voucherId,
        totalAmount,
        items: {
          create: body.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: productById.get(item.productId)!.price,
          })),
        },
        payment: {
          create: {
            method: body.paymentMethod,
            amount: totalAmount,
            status: "PENDING",
          },
        },
      },
      include: ORDER_INCLUDE,
    });

    await tx.notification.create({
      data: {
        storeId: body.storeId,
        orderId: createdOrder.id,
        message: `Đơn hàng mới từ ${createdOrder.customerName} - ${totalAmount.toLocaleString("vi-VN")}đ`,
      },
    });

    return createdOrder;
  });

  emitToStore(body.storeId, {
    type: "new_order",
    orderId: order.id,
    message: `Đơn hàng mới từ ${order.customerName} - ${totalAmount.toLocaleString("vi-VN")}đ`,
  });

  sendOrderNotificationEmail(order).catch((error) =>
    console.error("[email] Lỗi không mong muốn khi gửi thông báo đơn hàng:", error),
  );

  return NextResponse.json({ order }, { status: 201 });
}
