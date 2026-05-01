import type { Metadata } from "next";
import Link from "next/link";

type Props = { params: { state: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Sweet Shop ${params.state.toUpperCase()} | Fresh Sweets`,
    description: `Order fresh sweets in ${params.state.toUpperCase()} for delivery or pickup.`
  };
}

export default function StorePage({ params }: Props): React.ReactElement {
  const state = params.state.toUpperCase();
  const mapQuery = encodeURIComponent(`Sweet Shop ${state}`);
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    name: `Sweet Shop ${state}`,
    areaServed: state,
    servesCuisine: "Desserts",
    url: `/store/${params.state}`,
    priceRange: "$$"
  };

  return (
    <main style={{ padding: 16 }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <h1>Sweet Shop in {state}</h1>
      <p>Fresh sweets delivered in {state}. Same-day pickup is available.</p>
      <iframe
        title={`Sweet Shop ${state} map`}
        src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
        loading="lazy"
        style={{ width: "100%", maxWidth: 720, height: 320, border: 0, marginBottom: 16 }}
      />
      <Link href="/menu">Go to Menu</Link>
    </main>
  );
}
