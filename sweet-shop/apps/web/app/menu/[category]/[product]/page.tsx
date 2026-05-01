import type { Metadata } from "next";
import { getApiBaseUrl } from "../../../../lib/config";
import { getServerLang } from "../../../../lib/i18n-server";
import { DEMO_MENU } from "../../../../lib/demo-data";

type Product = {
  id: string;
  slug: string;
  imageUrl: string;
  price: string;
  name: Record<string, string>;
  description: Record<string, string>;
};
type Category = { slug: string; name: Record<string, string>; products: Product[] };
type Props = { params: { category: string; product: string } };

export function generateStaticParams(): Array<{ category: string; product: string }> {
  return DEMO_MENU.flatMap((category) =>
    category.products.map((product) => ({
      category: category.slug,
      product: product.slug
    }))
  );
}

async function getProduct(categorySlug: string, productSlug: string): Promise<{ category: Category; product: Product } | null> {
  let categories: Category[] = [];
  try {
    const res = await fetch(`${getApiBaseUrl()}/menu`, { cache: "no-store" });
    categories = res.ok ? ((await res.json()) as Category[]) : (DEMO_MENU as unknown as Category[]);
  } catch {
    categories = DEMO_MENU as unknown as Category[];
  }
  const category = categories.find((item) => item.slug === categorySlug);
  if (!category) return null;
  const product = category.products.find((item) => item.slug === productSlug);
  if (!product) return null;
  return { category, product };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getProduct(params.category, params.product);
  if (!data) return { title: "المنتج غير موجود | سويت شوب" };
  return {
    title: `${data.product.name.ar ?? data.product.name.en} | سويت شوب`,
    description: data.product.description.ar ?? data.product.description.en
  };
}

export default async function ProductPage({ params }: Props): Promise<React.ReactElement> {
  const lang = getServerLang();
  const data = await getProduct(params.category, params.product);
  if (!data) {
    return (
      <main style={{ padding: 16 }}>
        <h1>{lang === "ar" ? "المنتج غير موجود" : "Product not found"}</h1>
      </main>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: lang === "ar" ? (data.product.name.ar ?? data.product.name.en) : (data.product.name.en ?? data.product.name.ar),
    description:
      lang === "ar"
        ? (data.product.description.ar ?? data.product.description.en)
        : (data.product.description.en ?? data.product.description.ar),
    image: data.product.imageUrl,
    offers: {
      "@type": "Offer",
      price: data.product.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock"
    }
  };

  return (
    <main style={{ padding: 16 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1>{lang === "ar" ? (data.product.name.ar ?? data.product.name.en) : (data.product.name.en ?? data.product.name.ar)}</h1>
      <img
        src={data.product.imageUrl}
        alt={
          lang === "ar"
            ? `${data.product.name.ar ?? data.product.name.en} من سويت شوب`
            : `${data.product.name.en ?? data.product.name.ar} sweet from Sweet Shop`
        }
        loading="lazy"
        style={{ maxWidth: 360, width: "100%", borderRadius: 10 }}
      />
      <p>
        {lang === "ar"
          ? (data.product.description.ar ?? data.product.description.en)
          : (data.product.description.en ?? data.product.description.ar)}
      </p>
      <p>${data.product.price}</p>
    </main>
  );
}
