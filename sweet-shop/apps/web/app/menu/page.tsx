"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getCart, saveCart } from "../../lib/cart";
import { detectLang, t, type Lang } from "../../lib/i18n";
import { getApiBaseUrl } from "../../lib/config";
import { DEMO_MENU } from "../../lib/demo-data";

type Product = { id: string; slug: string; name: Record<string, string>; price: string; imageUrl?: string };
type Category = { id: string; slug: string; name: Record<string, string>; products: Product[] };

export default function MenuPage(): React.ReactElement {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    setLang(detectLang());
    fetch(`${getApiBaseUrl()}/menu`)
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => setCategories(DEMO_MENU));
  }, []);

  useEffect(() => {
    const totalItems = getCart().reduce((acc, item) => acc + item.quantity, 0);
    setCartCount(totalItems);
  }, []);

  function addToCart(product: Product): void {
    const cart = getCart();
    const existing = cart.find((item) => item.productId === product.id);
    const next = existing
      ? cart.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                lineTotal: Number((item.unitPrice * (item.quantity + 1)).toFixed(2))
              }
            : item
        )
      : [
          ...cart,
          {
            productId: product.id,
            productName: product.name.ar ?? product.name.en ?? "Sweet",
            quantity: 1,
            unitPrice: Number(product.price),
            lineTotal: Number(product.price)
          }
        ];
    saveCart(next);
    setCartCount(next.reduce((acc, item) => acc + item.quantity, 0));
  }

  const filtered = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        products: category.products.filter((p) =>
          (p.name.en ?? "").toLowerCase().includes(search.toLowerCase())
        )
      })),
    [categories, search]
  );

  return (
    <main>
      <section className="hero">
        <span className="chip">{lang === "ar" ? "حلويات شرقية فاخرة" : "Traditional & Premium"}</span>
        <h1>{t(lang, "menuTitle")}</h1>
        <p>
          {lang === "ar"
            ? "تصفح تشكيلتنا اليومية من الحلويات وأضف المفضلة إلى السلة."
            : "Browse our daily sweet selection and add your favorites to cart."}
        </p>
      </section>

      <h2 className="section-title">{t(lang, "cartItems")}: {cartCount}</h2>
      <input
        className="input"
        placeholder={t(lang, "searchSweets")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 12 }}
      />
      {filtered.map((category) => (
        <section key={category.id} style={{ marginTop: "1.5rem" }}>
          <h2>{category.name.en}</h2>
          <div className="grid product-grid">
            {category.products.map((product) => (
              <article key={product.id} className="card">
                <img
                  src={product.imageUrl ?? "https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?auto=format&fit=crop&w=800&q=80"}
                  alt={`${product.name.en} sweet box`}
                  loading="lazy"
                  style={{ width: "100%", height: 150, objectFit: "cover", borderRadius: 12 }}
                />
                <h4>{lang === "ar" ? (product.name.ar ?? product.name.en) : (product.name.en ?? product.name.ar)}</h4>
                <p className="muted">${product.price}</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-primary" onClick={() => addToCart(product)}>
                    {t(lang, "addToCart")}
                  </button>
                  <Link href={`/menu/${category.slug}/${product.slug}`}>
                    <button className="btn btn-soft" type="button">
                      {t(lang, "details")}
                    </button>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
      <div style={{ marginTop: "1.5rem" }}>
        <Link href="/checkout">
          <button className="btn btn-primary" type="button">
            {t(lang, "goToCheckout")}
          </button>
        </Link>
      </div>
    </main>
  );
}
