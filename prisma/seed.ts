import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!.replace(/^file:/, ""),
});
const prisma = new PrismaClient({ adapter });

const STORE = {
  name: "All In Coffee",
  address: "1B Hoàng Diệu, Quận 4, TP.HCM",
  phone: "0764917190",
};

const CATEGORY = { name: "Thực đơn", slug: "thuc-don" };

const PRODUCTS = [
  {
    name: "Bạc xỉu",
    slug: "bac-xiu",
    description: "Cà phê sữa đá phong cách All In Coffee, béo thơm đậm vị.",
    price: 45000,
    imageUrl: "/products/bac-xiu.jpg",
  },
  {
    name: "Bạc xỉu oatside",
    slug: "bac-xiu-oatside",
    description: "Bạc xỉu kết hợp sữa yến mạch Oatside thanh nhẹ, béo tự nhiên.",
    price: 50000,
    imageUrl: "/products/bac-xiu-oatside.jpg",
  },
  {
    name: "Americano Mơ ổi hồng",
    slug: "americano-mo-oi-hong",
    description: "Americano kết hợp mơ và ổi hồng, chua ngọt sảng khoái.",
    price: 45000,
    imageUrl: "/products/americano-mo-oi-hong.jpg",
  },
  {
    name: "Double Espresso",
    slug: "double-espresso",
    description: "Espresso đúp đậm đà, dành cho tín đồ cà phê nguyên bản.",
    price: 50000,
    imageUrl: "/products/double-espresso.jpg",
  },
  {
    name: "Trà bưởi hồng",
    slug: "tra-buoi-hong",
    description: "Trà bưởi hồng thanh mát cùng tép bưởi tươi giòn sần sật.",
    price: 40000,
    imageUrl: "/products/tra-buoi-hong.jpg",
  },
];

const VOUCHERS = [
  {
    code: "WELCOME10",
    description: "Giảm 10% cho đơn đầu tiên",
    discountType: "PERCENT" as const,
    discountValue: 10,
  },
  {
    code: "FREESHIP20",
    description: "Giảm 20.000đ (tương đương miễn phí ship)",
    discountType: "FIXED" as const,
    discountValue: 20000,
  },
  {
    code: "SALE15K",
    description: "Giảm ngay 15.000đ cho mọi đơn hàng",
    discountType: "FIXED" as const,
    discountValue: 15000,
  },
];

async function main() {
  // Reset toàn bộ dữ liệu cũ (app đang trong giai đoạn dựng, chưa có đơn hàng thật)
  await prisma.notification.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.store.deleteMany();

  await prisma.store.create({ data: STORE });

  const category = await prisma.category.create({ data: CATEGORY });

  for (const product of PRODUCTS) {
    await prisma.product.create({ data: { ...product, categoryId: category.id } });
  }

  for (const voucher of VOUCHERS) {
    await prisma.voucher.create({ data: voucher });
  }
}

main()
  .then(async () => {
    console.log("Seed thành công");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
