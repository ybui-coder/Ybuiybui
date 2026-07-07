export default function Footer() {
  return (
    <footer className="mt-16 border-t border-black/10 bg-brand-dark py-8 text-sm text-white/80">
      <div className="mx-auto max-w-6xl px-4">
        <p className="font-semibold text-white">All-In Coffee</p>
        <p className="mt-1">
          Dự án demo website đặt đồ uống &amp; hệ thống quản lý đơn hàng tự động.
        </p>
        <p className="mt-4 text-xs text-white/50">
          © {new Date().getFullYear()} All-In Coffee. Đây là dự án demo, không liên kết với
          Highlands Coffee.
        </p>
      </div>
    </footer>
  );
}
