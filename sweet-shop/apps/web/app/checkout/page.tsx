"use client";

import { useEffect, useState } from "react";
import { clearCart, getCart, getSelectedStore } from "../../lib/cart";
import { detectLang, t, type Lang } from "../../lib/i18n";
import { getApiBaseUrl } from "../../lib/config";

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
    const response = await fetch(`${getApiBaseUrl()}/orders`, {
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
    <main>
      <section className="hero">
        <span className="chip">{lang === "ar" ? "طلب كضيف" : "Guest Checkout"}</span>
        <h1>{t(lang, "checkoutTitle")}</h1>
        <p>
          {lang === "ar"
            ? "أكمل طلبك خلال دقيقة واحدة فقط. الدفع نقدا عند التوصيل أو الاستلام."
            : "Complete your order in under one minute. Cash payment on delivery or pickup."}
        </p>
      </section>
      <section className="card" style={{ marginTop: "1.2rem" }}>
        <div className="form-grid">
          <input className="input" placeholder={t(lang, "fullName")} value={name} onChange={(e) => setName(e.target.value)} />
          <input className="input" placeholder={t(lang, "phone")} value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input className="input" placeholder={t(lang, "emailOptional")} value={email} onChange={(e) => setEmail(e.target.value)} />
          <select className="select" value={type} onChange={(e) => setType(e.target.value as "DELIVERY" | "PICKUP")}>
            <option value="DELIVERY">{t(lang, "delivery")}</option>
            <option value="PICKUP">{t(lang, "pickup")}</option>
          </select>
          {type === "DELIVERY" ? (
            <textarea
              className="textarea"
              placeholder={t(lang, "deliveryAddress")}
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
            />
          ) : null}
          <textarea
            className="textarea"
            placeholder={t(lang, "specialNote")}
            value={specialNote}
            onChange={(e) => setSpecialNote(e.target.value)}
          />
          <button className="btn btn-primary" onClick={() => void submitOrder()} disabled={loading}>
            {loading ? t(lang, "submitting") : t(lang, "submitCashOrder")}
          </button>
        </div>
      </section>
      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}
      {orderNumber ? <p>Order confirmed: {orderNumber}</p> : null}
    </main>
  );
}
