import Link from "next/link";
import type { Metadata } from "next";
import { getApiBaseUrl } from "../../lib/config";
import { DEMO_STORES } from "../../lib/demo-data";
import { getServerLang, tServer } from "../../lib/i18n-server";

type Store = { id: string; name: string; state: string; address: string };

export const metadata: Metadata = {
  title: "فروع سويت شوب في سوريا",
  description: "تصفح فروع سويت شوب في دمشق وحلب وحمص للطلب أونلاين."
};

async function getStores(): Promise<Store[]> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/stores`, { cache: "no-store" });
    if (!res.ok) return DEMO_STORES;
    return (await res.json()) as Store[];
  } catch {
    return DEMO_STORES;
  }
}

export default async function StoresPage(): Promise<React.ReactElement> {
  const stores = await getStores();
  const lang = getServerLang();
  return (
    <main>
      <section className="hero">
        <span className="chip">{lang === "ar" ? "داخل سوريا" : "Across Syria"}</span>
        <h1>{tServer(lang, "allLocations")}</h1>
        <p>
          {lang === "ar"
            ? "اختر أقرب فرع واستمتع بالتوصيل السريع أو الاستلام من الفرع."
            : "Pick the nearest branch and enjoy fast delivery or pickup."}
        </p>
      </section>
      <h2 className="section-title">{tServer(lang, "navStores")}</h2>
      <div className="grid store-grid">
        {stores.map((store) => (
          <article key={store.id} className="card">
            <span className="chip">{store.state}</span>
            <h3>{store.name}</h3>
            <p className="muted">{store.address}</p>
            <Link href={`/store/${store.state.toLowerCase()}`}>
              <button className="btn btn-primary" type="button">
                {tServer(lang, "viewStore")}
              </button>
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
