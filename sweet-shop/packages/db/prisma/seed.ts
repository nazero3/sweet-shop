import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const ownerEmail = process.env.OWNER_LOGIN_EMAIL ?? "owner@sweetshop.com";
  const ownerPassword = process.env.OWNER_LOGIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await bcrypt.hash(ownerPassword, 10);

  const store = await prisma.store.upsert({
    where: { id: "seed-store-tx" },
    update: {},
    create: {
      id: "seed-store-tx",
      name: "Sweet Shop Texas",
      state: "TX",
      address: "123 Dessert Ave, Houston, TX",
      phone: "+1-555-100-2000",
      email: "tx@sweetshop.com",
      operatingHours: {
        monday: "09:00-21:00",
        tuesday: "09:00-21:00",
        wednesday: "09:00-21:00",
        thursday: "09:00-21:00",
        friday: "09:00-23:00",
        saturday: "09:00-23:00",
        sunday: "10:00-20:00"
      },
      deliveryZones: ["77001", "77002", "77003"],
      isActive: true
    }
  });

  const category = await prisma.category.upsert({
    where: { slug: "baklava" },
    update: {},
    create: {
      slug: "baklava",
      name: { en: "Baklava", ar: "بقلاوة" },
      imageUrl: "https://images.unsplash.com/photo-1551024601-bec78aea704b",
      sortOrder: 1,
      isActive: true
    }
  });

  await prisma.product.upsert({
    where: { slug: "classic-baklava" },
    update: {},
    create: {
      slug: "classic-baklava",
      name: { en: "Classic Baklava", ar: "بقلاوة كلاسيك" },
      description: {
        en: "Traditional layered pastry with pistachio and syrup.",
        ar: "عجينة طبقية تقليدية مع الفستق والقطر."
      },
      price: 12.5,
      categoryId: category.id,
      imageUrl: "https://images.unsplash.com/photo-1615887023516-90460d00e8eb",
      isAvailable: true
    }
  });

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
  console.log("Seed completed", { storeId: store.id, ownerEmail });
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
