import Link from "next/link";
import type { Metadata } from "next";

type Store = { id: string; name: string; state: string; address: string };

export const metadata: Metadata = {
  title: "Sweet Shop Stores by State",
  description: "Browse Sweet Shop store locations by state for delivery and pickup orders."
};

async function getStores(): Promise<Store[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stores`, { cache: "no-store" });
  if (!res.ok) return [];
  return (await res.json()) as Store[];
}

export default async function StoresPage(): Promise<React.ReactElement> {
  const stores = await getStores();
  return (
    <main style={{ padding: 16 }}>
      <h1>All Sweet Shop Locations</h1>
      <ul>
        {stores.map((store) => (
          <li key={store.id}>
            <Link href={`/store/${store.state.toLowerCase()}`}>{store.name}</Link> - {store.address}
          </li>
        ))}
      </ul>
    </main>
  );
}
