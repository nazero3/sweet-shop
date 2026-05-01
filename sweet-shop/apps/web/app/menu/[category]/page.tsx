import Link from "next/link";
import type { Metadata } from "next";
import { getApiBaseUrl } from "../../../lib/config";
import { getServerLang } from "../../../lib/i18n-server";
import { DEMO_MENU } from "../../../lib/demo-data";

type Product = { id: string; slug: string; name: Record<string, string>; description: Record<string, string> };
type Category = { id: string; slug: string; name: Record<string, string>; products: Product[] };
type Props = { params: { category: string } };

export function generateStaticParams(): Array<{ category: string }> {
  return DEMO_MENU.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `حلويات ${params.category} | سويت شوب`,
    description: `اكتشف تشكيلة ${params.category} المتاحة للتوصيل والاستلام.`
  };
}

async function getCategory(slug: string): Promise<Category | null> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/menu`, { cache: "no-store" });
    if (!res.ok) return DEMO_MENU.find((category) => category.slug === slug) ?? null;
    const categories = (await res.json()) as Category[];
    return categories.find((category) => category.slug === slug) ?? null;
  } catch {
    return DEMO_MENU.find((category) => category.slug === slug) ?? null;
  }
}

export default async function CategoryPage({ params }: Props): Promise<React.ReactElement> {
  const lang = getServerLang();
  const category = await getCategory(params.category);
  if (!category) {
    return (
      <main style={{ padding: 16 }}>
        <h1>{lang === "ar" ? "التصنيف غير موجود" : "Category not found"}</h1>
      </main>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: lang === "ar" ? "القائمة" : "Menu", item: "/menu" },
      {
        "@type": "ListItem",
        position: 2,
        name: lang === "ar" ? (category.name.ar ?? category.name.en) : (category.name.en ?? category.name.ar),
        item: `/menu/${category.slug}`
      }
    ]
  };

  return (
    <main style={{ padding: 16 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1>{lang === "ar" ? (category.name.ar ?? category.name.en) : (category.name.en ?? category.name.ar)}</h1>
      <ul>
        {category.products.map((product) => (
          <li key={product.id}>
            <Link href={`/menu/${category.slug}/${product.slug}`}>
              {lang === "ar" ? (product.name.ar ?? product.name.en) : (product.name.en ?? product.name.ar)}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
