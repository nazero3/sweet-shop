"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Link from "next/link";

type Props = { params: { orderId: string } };

export default function OrderTrackPage({ params }: Props): React.ReactElement {
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/track/${params.orderId}`)
      .then((res) => res.json())
      .then((data) => setStatus(data.status ?? "Unknown"))
      .catch(() => setStatus("Unavailable"));

    const socket = io(process.env.NEXT_PUBLIC_API_URL ?? "");
    socket.emit("join:order", params.orderId);
    socket.on("order:status", (event: { orderNumber: string; status: string }) => {
      if (event.orderNumber === params.orderId) setStatus(event.status);
    });

    return () => socket.disconnect();
  }, [params.orderId]);

  return (
    <main style={{ padding: 16 }}>
      <h1>Track Order {params.orderId}</h1>
      <p>Current status: {status}</p>
      <Link href="/">Back to stores</Link>
    </main>
  );
}
