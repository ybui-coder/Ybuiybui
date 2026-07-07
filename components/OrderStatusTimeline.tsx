const STEPS = [
  { status: "PENDING", label: "Chờ xác nhận" },
  { status: "CONFIRMED", label: "Đã xác nhận" },
  { status: "SHIPPING", label: "Đang vận chuyển" },
  { status: "COMPLETED", label: "Hoàn tất" },
] as const;

export default function OrderStatusTimeline({ status }: { status: string }) {
  if (status === "CANCELLED") {
    return <p className="font-semibold text-red-600">Đơn hàng đã bị hủy</p>;
  }

  const currentIndex = STEPS.findIndex((step) => step.status === status);

  return (
    <div className="flex items-center">
      {STEPS.map((step, index) => (
        <div key={step.status} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-2">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                index <= currentIndex ? "bg-brand text-white" : "bg-black/10 text-foreground/40"
              }`}
            >
              {index + 1}
            </div>
            <span
              className={`text-xs font-medium ${
                index <= currentIndex ? "text-brand-dark" : "text-foreground/40"
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < STEPS.length - 1 && (
            <div
              className={`mx-2 h-0.5 flex-1 ${
                index < currentIndex ? "bg-brand" : "bg-black/10"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
