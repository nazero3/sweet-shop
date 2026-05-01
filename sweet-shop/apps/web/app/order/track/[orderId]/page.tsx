"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Link from "next/link";
import { getApiBaseUrl } from "../../../../lib/config";
import { detectLang, t, type Lang } from "../../../../lib/i18n";

type Props = { params: { orderId: string } };

export function generateStaticParams(): Array<{ orderId: string }> {
  return [{ orderId: "SS-DM-00001" }];
}

export default function OrderTrackPage({ params }: Props): React.ReactElement {
  const [status, setStatus] = useState("Loading...");
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    setLang(detectLang());
    fetch(`${getApiBaseUrl()}/orders/track/${params.orderId}`)
      .then((res) => res.json())
      .then((data) => setStatus(data.status ?? "Unknown"))
      .catch(() => setStatus("Unavailable"));

    const socket = io(getApiBaseUrl());
    socket.emit("join:order", params.orderId);
    socket.on("order:status", (event: { orderNumber: string; status: string }) => {
      if (event.orderNumber === params.orderId) setStatus(event.status);
    });

    return () => {
      socket.disconnect();
    };
  }, [params.orderId]);

  return (
    <main style={{ padding: 16 }}>
      <h1>{t(lang, "trackOrder")} {params.orderId}</h1>
      <p>{t(lang, "currentStatus")}: {status}</p>
      <Link href="/">{t(lang, "backToStores")}</Link>
    </main>
  );
}
