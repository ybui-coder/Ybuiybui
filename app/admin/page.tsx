import AdminDashboard from "@/components/AdminDashboard";

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-extrabold text-brand-dark">Hub quản lý &amp; đối soát</h1>
      <p className="mb-8 text-sm text-foreground/60">
        Tổng quan đơn hàng toàn hệ thống, trạng thái vận chuyển và đối soát tiền đặt hàng online.
      </p>
      <AdminDashboard />
    </div>
  );
}
