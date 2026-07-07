import Image from "next/image";
import { formatVnd } from "@/lib/format";

const BANK_INFO = {
  bankName: "MB Bank",
  accountHolder: "BUI VAN NHU Y",
  accountNumber: "0764917190",
};

export default function PaymentQrCard({
  orderId,
  amount,
}: {
  orderId: string;
  amount: number;
}) {
  return (
    <div className="mt-6 rounded-xl border border-brand-gold/40 bg-brand-gold/5 p-5">
      <p className="font-semibold text-brand-dark">Chuyển khoản thanh toán</p>
      <p className="mt-1 text-sm text-foreground/70">
        Quét mã QR hoặc chuyển khoản theo thông tin bên dưới. Đơn hàng sẽ được cửa hàng xác nhận
        đã thanh toán sau khi kiểm tra giao dịch.
      </p>

      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="relative h-56 w-40 shrink-0 overflow-hidden rounded-lg border border-black/10 bg-white">
          <Image
            src="/brand/payment-qr.jpg"
            alt="Mã QR chuyển khoản"
            fill
            className="object-cover"
            sizes="160px"
          />
        </div>
        <div className="flex-1 text-sm">
          <div className="flex justify-between border-b border-black/5 py-1.5">
            <span className="text-foreground/60">Ngân hàng</span>
            <span className="font-medium">{BANK_INFO.bankName}</span>
          </div>
          <div className="flex justify-between border-b border-black/5 py-1.5">
            <span className="text-foreground/60">Chủ tài khoản</span>
            <span className="font-medium">{BANK_INFO.accountHolder}</span>
          </div>
          <div className="flex justify-between border-b border-black/5 py-1.5">
            <span className="text-foreground/60">Số tài khoản</span>
            <span className="font-medium">{BANK_INFO.accountNumber}</span>
          </div>
          <div className="flex justify-between border-b border-black/5 py-1.5">
            <span className="text-foreground/60">Số tiền</span>
            <span className="font-semibold text-brand">{formatVnd(amount)}</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-foreground/60">Nội dung CK</span>
            <span className="font-medium">DH{orderId.slice(-6).toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
