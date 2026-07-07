import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!.replace(/^file:/, ""),
});
const prisma = new PrismaClient({ adapter });

const CATEGORIES = [
  { name: "Cà Phê", slug: "ca-phe" },
  { name: "Trà", slug: "tra" },
  { name: "Freeze", slug: "freeze" },
  { name: "Bánh & Ăn Nhẹ", slug: "banh-an-nhe" },
];

const PRODUCTS: Record<
  string,
  { name: string; slug: string; description: string; price: number; imageUrl: string }[]
> = {
  "ca-phe": [
    {
      name: "Phin Sữa Đá",
      slug: "phin-sua-da",
      description: "Cà phê phin truyền thống pha cùng sữa đặc, đá viên mát lạnh.",
      price: 39000,
      imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600",
    },
    {
      name: "Bạc Xỉu",
      slug: "bac-xiu",
      description: "Vị cà phê nhẹ nhàng hòa quyện cùng sữa tươi và sữa đặc thơm béo.",
      price: 45000,
      imageUrl: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600",
    },
    {
      name: "Cà Phê Đen Đá",
      slug: "ca-phe-den-da",
      description: "Đậm đà hương vị cà phê phin nguyên bản.",
      price: 35000,
      imageUrl: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=600",
    },
  ],
  tra: [
    {
      name: "Trà Sen Vàng",
      slug: "tra-sen-vang",
      description: "Trà ô long hương sen thanh tao, vị ngọt dịu nhẹ.",
      price: 49000,
      imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600",
    },
    {
      name: "Trà Xanh Đào",
      slug: "tra-xanh-dao",
      description: "Trà xanh kết hợp cùng đào ngâm thơm mát.",
      price: 49000,
      imageUrl: "https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=600",
    },
  ],
  freeze: [
    {
      name: "Freeze Trà Xanh",
      slug: "freeze-tra-xanh",
      description: "Đá xay trà xanh mịn màng, phủ kem tươi béo ngậy.",
      price: 55000,
      imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600",
    },
    {
      name: "Freeze Cà Phê",
      slug: "freeze-ca-phe",
      description: "Đá xay cà phê đậm vị, phủ kem tươi.",
      price: 55000,
      imageUrl: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600",
    },
  ],
  "banh-an-nhe": [
    {
      name: "Bánh Mì Que Pate",
      slug: "banh-mi-que-pate",
      description: "Bánh mì que giòn rụm cùng pate béo thơm.",
      price: 25000,
      imageUrl: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=600",
    },
    {
      name: "Bánh Croissant",
      slug: "banh-croissant",
      description: "Bánh sừng bò bơ Pháp thơm lừng.",
      price: 35000,
      imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600",
    },
  ],
};

const STORES = [
  { name: "All-In Coffee Nguyễn Huệ", address: "26 Nguyễn Huệ, Q.1, TP.HCM", phone: "0281234001" },
  { name: "All-In Coffee Láng Hạ", address: "72 Láng Hạ, Đống Đa, Hà Nội", phone: "0241234002" },
  { name: "All-In Coffee Hải Châu", address: "15 Trần Phú, Hải Châu, Đà Nẵng", phone: "0231234003" },
];

async function main() {
  for (const store of STORES) {
    await prisma.store.upsert({
      where: { phone: store.phone },
      update: { name: store.name, address: store.address },
      create: store,
    });
  }

  for (const category of CATEGORIES) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });

    for (const product of PRODUCTS[category.slug]) {
      await prisma.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: { ...product, categoryId: created.id },
      });
    }
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
