"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { saveSelectedStore } from "../lib/cart";
import { detectLang, t, type Lang } from "../lib/i18n";
import { getApiBaseUrl } from "../lib/config";
import { DEMO_STORES } from "../lib/demo-data";

type Store = { id: string; name: string; state: string; address: string };

export default function HomePage(): React.ReactElement {
  const [stores, setStores] = useState<Store[]>([]);
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    setLang(detectLang());
    fetch(`${getApiBaseUrl()}/stores`)
      .then((res) => res.json())
      .then((data) => setStores(data))
      .catch(() => setStores(DEMO_STORES));
  }, []);

  return (
    <main>
      <section className="hero">
        <span className="chip">{lang === "ar" ? "يومي طازج" : "Fresh Daily"}</span>
        <h1>{t(lang, "storesTitle")}</h1>
        <p>
          {t(lang, "storesSubtitle")}{" "}
          {lang === "ar"
            ? "حلويات شرقية حرفية مستوحاة من تراث دمشق."
            : "Handcrafted oriental sweets inspired by Damascus heritage."}
        </p>
      </section>

      <h2 className="section-title">{t(lang, "chooseStore")}</h2>
      <div className="grid store-grid">
        {stores.map((store) => (
          <article key={store.id} className="card">
            <span className="chip">{store.state}</span>
            <h3>{store.name}</h3>
            <p className="muted">{store.address}</p>
            <Link href={`/store/${store.state.toLowerCase()}`} onClick={() => saveSelectedStore(store)}>
              <button className="btn btn-primary" type="button">
                {t(lang, "selectStore")}
              </button>
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
