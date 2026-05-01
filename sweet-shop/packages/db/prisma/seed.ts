import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const ownerEmail = process.env.OWNER_LOGIN_EMAIL ?? "owner@sweetshop.com";
  const ownerPassword = process.env.OWNER_LOGIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await bcrypt.hash(ownerPassword, 10);

  await prisma.store.deleteMany({
    where: {
      OR: [
        { id: "seed-store-tx" },
        { state: "TX" },
        { state: "tx" },
        { state: { notIn: ["دمشق", "حلب", "حمص"] } }
      ]
    }
  });

  const storeConfigs = [
    {
      id: "seed-store-damascus",
      name: "Sweet Shop Damascus",
      state: "دمشق",
      address: "شارع بغداد، دمشق، سوريا",
      phone: "+963-11-222-3344",
      email: "damascus@sweetshop.com",
      deliveryZones: ["دمشق القديمة", "المالكي", "أبو رمانة"]
    },
    {
      id: "seed-store-aleppo",
      name: "Sweet Shop Aleppo",
      state: "حلب",
      address: "السبع بحرات، حلب، سوريا",
      phone: "+963-21-555-2211",
      email: "aleppo@sweetshop.com",
      deliveryZones: ["السليمانية", "الجميلية", "الميدان"]
    },
    {
      id: "seed-store-homs",
      name: "Sweet Shop Homs",
      state: "حمص",
      address: "شارع الحضارة، حمص، سوريا",
      phone: "+963-31-444-1100",
      email: "homs@sweetshop.com",
      deliveryZones: ["عكرمة", "الوعر", "بابا عمرو"]
    }
  ];

  for (const storeConfig of storeConfigs) {
    await prisma.store.upsert({
      where: { id: storeConfig.id },
      update: {
        name: storeConfig.name,
        state: storeConfig.state,
        address: storeConfig.address,
        phone: storeConfig.phone,
        email: storeConfig.email,
        deliveryZones: storeConfig.deliveryZones
      },
      create: {
        ...storeConfig,
        operatingHours: {
          monday: "09:00-21:00",
          tuesday: "09:00-21:00",
          wednesday: "09:00-21:00",
          thursday: "09:00-21:00",
          friday: "09:00-23:00",
          saturday: "09:00-23:00",
          sunday: "10:00-20:00"
        },
        isActive: true
      }
    });
  }

  const categories = [
    {
      slug: "baklava",
      name: { en: "Baklava", ar: "بقلاوة" },
      imageUrl: "https://images.unsplash.com/photo-1599599810694-b5b37304c041?auto=format&fit=crop&w=1200&q=80",
      sortOrder: 1
    },
    {
      slug: "maamoul",
      name: { en: "Maamoul", ar: "معمول" },
      imageUrl: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=1200&q=80",
      sortOrder: 2
    },
    {
      slug: "nougat",
      name: { en: "Nougat & Candy", ar: "نوجا وحلوى" },
      imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=80",
      sortOrder: 3
    }
  ];

  for (const categoryConfig of categories) {
    await prisma.category.upsert({
      where: { slug: categoryConfig.slug },
      update: categoryConfig,
      create: {
        ...categoryConfig,
        isActive: true
      }
    });
  }

  const baklavaCategory = await prisma.category.findUniqueOrThrow({ where: { slug: "baklava" } });
  const maamoulCategory = await prisma.category.findUniqueOrThrow({ where: { slug: "maamoul" } });
  const nougatCategory = await prisma.category.findUniqueOrThrow({ where: { slug: "nougat" } });

  const products = [
    {
      slug: "damascus-pistachio-baklava",
      name: { en: "Damascus Pistachio Baklava", ar: "بقلاوة دمشقية بالفستق" },
      description: {
        en: "Crispy phyllo layers, rich pistachio filling, and fragrant syrup.",
        ar: "رقائق ذهبية مقرمشة مع فستق حلبي فاخر وقطر عطري."
      },
      price: 18.5,
      categoryId: baklavaCategory.id,
      imageUrl: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=1200&q=80"
    },
    {
      slug: "aleppo-walnut-baklava",
      name: { en: "Aleppo Walnut Baklava", ar: "بقلاوة الجوز الحلبية" },
      description: {
        en: "Classic walnut baklava with balanced sweetness and buttery texture.",
        ar: "بقلاوة تقليدية بالجوز مع حلاوة متوازنة ونكهة غنية."
      },
      price: 16,
      categoryId: baklavaCategory.id,
      imageUrl: "https://images.unsplash.com/photo-1606293926249-ed22e7f25d5d?auto=format&fit=crop&w=1200&q=80"
    },
    {
      slug: "date-maamoul-box",
      name: { en: "Date Maamoul Box", ar: "علبة معمول تمر" },
      description: {
        en: "Soft semolina maamoul stuffed with premium date paste.",
        ar: "معمول سميد طري محشو بعجوة تمر فاخرة."
      },
      price: 11.75,
      categoryId: maamoulCategory.id,
      imageUrl: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=1200&q=80"
    },
    {
      slug: "pistachio-maamoul-box",
      name: { en: "Pistachio Maamoul Box", ar: "علبة معمول فستق" },
      description: {
        en: "Fine maamoul filled with pistachio cream and roasted nuts.",
        ar: "معمول فاخر محشو بكريمة الفستق والمكسرات المحمصة."
      },
      price: 13.25,
      categoryId: maamoulCategory.id,
      imageUrl: "https://images.unsplash.com/photo-1612197526593-8f9d62bd58f3?auto=format&fit=crop&w=1200&q=80"
    },
    {
      slug: "rose-nougat-bites",
      name: { en: "Rose Nougat Bites", ar: "قطع نوجا بالورد" },
      description: {
        en: "Chewy nougat infused with rose notes and pistachio crunch.",
        ar: "نوجا مطاطية بنكهة الورد مع قرمشة الفستق."
      },
      price: 9.5,
      categoryId: nougatCategory.id,
      imageUrl: "https://images.unsplash.com/photo-1481391032119-d89fee407e44?auto=format&fit=crop&w=1200&q=80"
    },
    {
      slug: "couture-candy-mix",
      name: { en: "Couture Candy Mix", ar: "تشكيلة حلوى فاخرة" },
      description: {
        en: "Colorful curated candy selection inspired by couture candy styles.",
        ar: "تشكيلة حلوى ملونة مستوحاة من أسلوب الحلوى الفاخر."
      },
      price: 14,
      categoryId: nougatCategory.id,
      imageUrl: "https://images.unsplash.com/photo-1575224300306-1b8da36134ec?auto=format&fit=crop&w=1200&q=80"
    }
  ];

  for (const productConfig of products) {
    await prisma.product.upsert({
      where: { slug: productConfig.slug },
      update: productConfig,
      create: {
        ...productConfig,
        isAvailable: true
      }
    });
  }

  await prisma.admin.upsert({
    where: { email: ownerEmail },
    update: { passwordHash },
    create: {
      name: "Owner",
      email: ownerEmail,
      phone: process.env.OWNER_PHONE ?? "+1000000000",
      passwordHash,
      notificationPreferences: { push: true, email: true },
      role: "OWNER"
    }
  });

  // eslint-disable-next-line no-console
  console.log("Seed completed", { stores: storeConfigs.length, products: products.length, ownerEmail });
}

void main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
