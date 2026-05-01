"use client";

import { useEffect, useState } from "react";
import { clearCart, getCart, getSelectedStore } from "../../lib/cart";
import { detectLang, t, type Lang } from "../../lib/i18n";

export default function CheckoutPage(): React.ReactElement {
  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState<"DELIVERY" | "PICKUP">("DELIVERY");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [specialNote, setSpecialNote] = useState("");
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    setLang(detectLang());
  }, []);

  async function submitOrder(): Promise<void> {
    setError("");
    const store = getSelectedStore();
    if (!store) {
      setError("Please select a store first.");
      return;
    }

    const items = getCart();
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!name || !phone) {
      setError("Name and phone are required.");
      return;
    }

    if (type === "DELIVERY" && !deliveryAddress.trim()) {
      setError("Delivery address is required for delivery orders.");
      return;
    }

    const subtotal = items.reduce((acc, item) => acc + item.lineTotal, 0);
    setLoading(true);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeId: store.id,
        storeState: store.state,
        type,
        customer: { name, phone, email },
        deliveryAddress: type === "DELIVERY" ? deliveryAddress : undefined,
        items,
        specialNote,
        subtotal
      })
    });
    const data = (await response.json()) as { orderNumber?: string; error?: string };
    if (!response.ok || !data.orderNumber) {
      setError(data.error ?? "Could not place order.");
      setLoading(false);
      return;
    }
    clearCart();
    setOrderNumber(data.orderNumber);
    setLoading(false);
  }

  return (
    <main style={{ padding: 16 }}>
      <h1>{t(lang, "checkoutTitle")}</h1>
      <input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
      <br />
      <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <br />
      <input placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
      <br />
      <select value={type} onChange={(e) => setType(e.target.value as "DELIVERY" | "PICKUP")}>
        <option value="DELIVERY">Delivery</option>
        <option value="PICKUP">Pickup</option>
      </select>
      <br />
      {type === "DELIVERY" ? (
        <>
          <textarea
            placeholder="Delivery address"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
          />
          <br />
        </>
      ) : null}
      <textarea
        placeholder="Special instruction note (optional)"
        value={specialNote}
        onChange={(e) => setSpecialNote(e.target.value)}
      />
      <br />
      <button onClick={() => void submitOrder()} disabled={loading}>
        {loading ? "Submitting..." : "Submit cash order"}
      </button>
      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}
      {orderNumber ? <p>Order confirmed: {orderNumber}</p> : null}
    </main>
  );
}
