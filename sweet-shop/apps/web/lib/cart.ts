export type CartItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

const CART_KEY = "sweet-shop-cart";
const STORE_KEY = "sweet-shop-selected-store";

export type SelectedStore = { id: string; name: string; state: string; address: string };

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(CART_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function clearCart(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CART_KEY);
}

export function saveSelectedStore(store: SelectedStore): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

export function getSelectedStore(): SelectedStore | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SelectedStore;
  } catch {
    return null;
  }
}
