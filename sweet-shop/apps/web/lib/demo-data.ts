export type DemoStore = { id: string; name: string; state: string; address: string };
export type DemoProduct = {
  id: string;
  slug: string;
  name: Record<string, string>;
  description: Record<string, string>;
  price: string;
  imageUrl: string;
};
export type DemoCategory = {
  id: string;
  slug: string;
  name: Record<string, string>;
  products: DemoProduct[];
};

export const DEMO_STORES: DemoStore[] = [
  { id: "damascus", name: "Sweet Shop Damascus", state: "دمشق", address: "شارع بغداد، دمشق، سوريا" },
  { id: "aleppo", name: "Sweet Shop Aleppo", state: "حلب", address: "السبع بحرات، حلب، سوريا" },
  { id: "homs", name: "Sweet Shop Homs", state: "حمص", address: "شارع الحضارة، حمص، سوريا" }
];

export const DEMO_MENU: DemoCategory[] = [
  {
    id: "baklava",
    slug: "baklava",
    name: { en: "Baklava", ar: "بقلاوة" },
    products: [
      {
        id: "p1",
        slug: "damascus-pistachio-baklava",
        name: { en: "Damascus Pistachio Baklava", ar: "بقلاوة دمشقية بالفستق" },
        description: {
          en: "Crispy phyllo layers with premium pistachio.",
          ar: "رقائق مقرمشة بحشوة فستق فاخر."
        },
        price: "18.50",
        imageUrl: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=1200&q=80"
      },
      {
        id: "p2",
        slug: "aleppo-walnut-baklava",
        name: { en: "Aleppo Walnut Baklava", ar: "بقلاوة الجوز الحلبية" },
        description: { en: "Classic walnut texture and balanced sweetness.", ar: "طعم جوز غني وحلاوة متوازنة." },
        price: "16.00",
        imageUrl: "https://images.unsplash.com/photo-1606293926249-ed22e7f25d5d?auto=format&fit=crop&w=1200&q=80"
      }
    ]
  },
  {
    id: "maamoul",
    slug: "maamoul",
    name: { en: "Maamoul", ar: "معمول" },
    products: [
      {
        id: "p3",
        slug: "date-maamoul-box",
        name: { en: "Date Maamoul Box", ar: "علبة معمول تمر" },
        description: { en: "Soft semolina cookies with date filling.", ar: "معمول سميد طري محشو بالعجوة." },
        price: "11.75",
        imageUrl: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=1200&q=80"
      }
    ]
  }
];
