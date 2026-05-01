import type { Metadata } from "next";

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

async function getProduct(categorySlug: string, productSlug: string): Promise<{ category: Category; product: Product } | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu`, { cache: "no-store" });
  if (!res.ok) return null;
  const categories = (await res.json()) as Category[];
  const category = categories.find((item) => item.slug === categorySlug);
  if (!category) return null;
  const product = category.products.find((item) => item.slug === productSlug);
  if (!product) return null;
  return { category, product };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getProduct(params.category, params.product);
  if (!data) return { title: "Product not found | Sweet Shop" };
  return {
    title: `${data.product.name.en} | Sweet Shop`,
    description: data.product.description.en
  };
}

export default async function ProductPage({ params }: Props): Promise<React.ReactElement> {
  const data = await getProduct(params.category, params.product);
  if (!data) {
    return (
      <main style={{ padding: 16 }}>
        <h1>Product not found</h1>
      </main>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: data.product.name.en,
    description: data.product.description.en,
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
      <h1>{data.product.name.en}</h1>
      <img
        src={data.product.imageUrl}
        alt={`${data.product.name.en} sweet from Sweet Shop`}
        loading="lazy"
        style={{ maxWidth: 360, width: "100%", borderRadius: 10 }}
      />
      <p>{data.product.description.en}</p>
      <p>${data.product.price}</p>
    </main>
  );
}
