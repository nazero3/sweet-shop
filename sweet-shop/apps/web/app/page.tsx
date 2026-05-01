"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { saveSelectedStore } from "../lib/cart";
import { detectLang, t, type Lang } from "../lib/i18n";

type Store = { id: string; name: string; state: string; address: string };

export default function HomePage(): React.ReactElement {
  const [stores, setStores] = useState<Store[]>([]);
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    setLang(detectLang());
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/stores`)
      .then((res) => res.json())
      .then((data) => setStores(data))
      .catch(() => setStores([]));
  }, []);

  return (
    <main style={{ padding: 16 }}>
      <h1>{t(lang, "storesTitle")}</h1>
      <p>{t(lang, "storesSubtitle")}</p>
      <ul>
        {stores.map((store) => (
          <li key={store.id}>
            <Link
              href={`/store/${store.state.toLowerCase()}`}
              onClick={() => saveSelectedStore(store)}
            >
              {store.name} - {store.state}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
