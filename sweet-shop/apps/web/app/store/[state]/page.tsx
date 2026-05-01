import type { Metadata } from "next";
import Link from "next/link";
import { getServerLang } from "../../../lib/i18n-server";
import { DEMO_STORES } from "../../../lib/demo-data";

type Props = { params: { state: string } };

export function generateStaticParams(): Array<{ state: string }> {
  return DEMO_STORES.map((store) => ({ state: store.state }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `سويت شوب ${params.state} | حلويات طازجة`,
    description: `اطلب الحلويات الطازجة في ${params.state} مع التوصيل أو الاستلام.`
  };
}

export default function StorePage({ params }: Props): React.ReactElement {
  const lang = getServerLang();
  const state = decodeURIComponent(params.state);
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
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <section className="hero">
        <span className="chip">{lang === "ar" ? "فرع محلي" : "Local branch"}</span>
        <h1>{lang === "ar" ? `سويت شوب - ${state}` : `Sweet Shop - ${state}`}</h1>
        <p>
          {lang === "ar"
            ? `حلويات طازجة يوميا في ${state} مع التوصيل أو الاستلام بنفس اليوم.`
            : `Fresh sweets in ${state} with same-day delivery or pickup.`}
        </p>
      </section>
      <h2 className="section-title">{lang === "ar" ? "موقع الفرع على الخريطة" : "Store location map"}</h2>
      <iframe
        title={`Sweet Shop ${state} map`}
        src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
        loading="lazy"
        style={{ width: "100%", maxWidth: 900, height: 340, border: 0, borderRadius: 14, marginBottom: 16 }}
      />
      <Link href="/menu">
        <button className="btn btn-primary" type="button">
          {lang === "ar" ? "الانتقال إلى القائمة" : "Go to Menu"}
        </button>
      </Link>
    </main>
  );
}
