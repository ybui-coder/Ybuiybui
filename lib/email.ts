import { Resend } from "resend";
import { formatVnd } from "@/lib/format";

const NOTIFY_EMAIL = "ybui@vibula.vn";

interface OrderForEmail {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  totalAmount: number;
  store: { name: string };
  payment: { method: "COD" | "ONLINE" } | null;
  items: { quantity: number; price: number; product: { name: string } }[];
}

export async function sendOrderNotificationEmail(order: OrderForEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(
      `[email] RESEND_API_KEY chưa cấu hình - bỏ qua gửi email cho đơn #${order.id.slice(-6)}`,
    );
    return;
  }

  const itemsHtml = order.items
    .map((item) => `<li>${item.product.name} x${item.quantity} — ${formatVnd(item.price * item.quantity)}</li>`)
    .join("");

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: "All In Coffee <onboarding@resend.dev>",
      to: NOTIFY_EMAIL,
      subject: `Đơn hàng mới #${order.id.slice(-6)} - ${formatVnd(order.totalAmount)}`,
      html: `
        <h2>Đơn hàng mới từ ${order.customerName}</h2>
        <p><b>SĐT:</b> ${order.customerPhone}</p>
        <p><b>Địa chỉ giao:</b> ${order.deliveryAddress}</p>
        <p><b>Cửa hàng nhận đơn:</b> ${order.store.name}</p>
        <p><b>Thanh toán:</b> ${order.payment?.method === "COD" ? "Khi nhận hàng" : "Online"}</p>
        <ul>${itemsHtml}</ul>
        <p><b>Tổng cộng:</b> ${formatVnd(order.totalAmount)}</p>
      `,
    });

    if (error) {
      console.error(`[email] Resend từ chối gửi cho đơn #${order.id.slice(-6)}:`, error);
      return;
    }
    console.log(`[email] Đã gửi thông báo đơn #${order.id.slice(-6)} (id: ${data?.id})`);
  } catch (error) {
    console.error(`[email] Gửi email thất bại cho đơn #${order.id.slice(-6)}:`, error);
  }
}
