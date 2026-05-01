import type { MetadataRoute } from "next";
import { getApiBaseUrl } from "../lib/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000";
  const staticRoutes = ["", "/stores", "/menu"].map((route) => ({
    url: `${base}${route}`,
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8
  }));

  const apiBaseUrl = getApiBaseUrl();
  const menuRes = await fetch(`${apiBaseUrl}/menu`, { cache: "no-store" }).catch(() => null);
  const storesRes = await fetch(`${apiBaseUrl}/stores`, { cache: "no-store" }).catch(() => null);
  const categories = menuRes && menuRes.ok ? ((await menuRes.json()) as Array<{ slug: string; products: Array<{ slug: string }> }>) : [];
  const stores = storesRes && storesRes.ok ? ((await storesRes.json()) as Array<{ state: string }>) : [];

  const dynamicRoutes: MetadataRoute.Sitemap = [
    ...stores.map((store) => ({
      url: `${base}/store/${store.state.toLowerCase()}`,
      changeFrequency: "daily" as const,
      priority: 0.8
    })),
    ...categories.flatMap((category) => [
      {
        url: `${base}/menu/${category.slug}`,
        changeFrequency: "daily" as const,
        priority: 0.7
      },
      ...category.products.map((product) => ({
        url: `${base}/menu/${category.slug}/${product.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.6
      }))
    ])
  ];

  return [...staticRoutes, ...dynamicRoutes];
}
