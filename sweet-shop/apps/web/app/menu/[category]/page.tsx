import Link from "next/link";
import type { Metadata } from "next";

type Product = { id: string; slug: string; name: Record<string, string>; description: Record<string, string> };
type Category = { id: string; slug: string; name: Record<string, string>; products: Product[] };
type Props = { params: { category: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `${params.category} Sweets | Sweet Shop`,
    description: `Explore ${params.category} sweets available for delivery and pickup.`
  };
}

async function getCategory(slug: string): Promise<Category | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu`, { cache: "no-store" });
  if (!res.ok) return null;
  const categories = (await res.json()) as Category[];
  return categories.find((category) => category.slug === slug) ?? null;
}

export default async function CategoryPage({ params }: Props): Promise<React.ReactElement> {
  const category = await getCategory(params.category);
  if (!category) {
    return (
      <main style={{ padding: 16 }}>
        <h1>Category not found</h1>
      </main>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Menu", item: "/menu" },
      { "@type": "ListItem", position: 2, name: category.name.en, item: `/menu/${category.slug}` }
    ]
  };

  return (
    <main style={{ padding: 16 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1>{category.name.en}</h1>
      <ul>
        {category.products.map((product) => (
          <li key={product.id}>
            <Link href={`/menu/${category.slug}/${product.slug}`}>{product.name.en}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
