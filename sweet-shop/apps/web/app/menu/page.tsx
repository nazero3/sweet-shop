"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getCart, saveCart } from "../../lib/cart";
import { detectLang, t, type Lang } from "../../lib/i18n";

type Product = { id: string; slug: string; name: Record<string, string>; price: string };
type Category = { id: string; slug: string; name: Record<string, string>; products: Product[] };

export default function MenuPage(): React.ReactElement {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    setLang(detectLang());
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu`)
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => setCategories([]));
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
            productName: product.name.en ?? "Sweet",
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
    <main style={{ padding: 16 }}>
      <h1>{t(lang, "menuTitle")}</h1>
      <p>Cart items: {cartCount}</p>
      <input
        placeholder="Search sweets"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 12, width: "100%" }}
      />
      {filtered.map((category) => (
        <section key={category.id}>
          <h2>{category.name.en}</h2>
          <ul>
            {category.products.map((product) => (
              <li key={product.id}>
                {product.name.en} - ${product.price}{" "}
                <button onClick={() => addToCart(product)}>Add to cart</button>{" "}
                <Link href={`/menu/${category.slug}/${product.slug}`}>Details</Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <Link href="/checkout">Go to checkout</Link>
    </main>
  );
}
