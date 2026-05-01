import Link from "next/link";
import { getServerLang, tServer } from "../../../../lib/i18n-server";

type Props = { params: { orderId: string } };

export function generateStaticParams(): Array<{ orderId: string }> {
  return [{ orderId: "SS-DM-00001" }];
}

export default function OrderTrackPage({ params }: Props): React.ReactElement {
  const lang = getServerLang();
  const status = lang === "ar" ? "قيد التحضير" : "Preparing";

  return (
    <main style={{ padding: 16 }}>
      <h1>{tServer(lang, "trackOrder")} {params.orderId}</h1>
      <p>{tServer(lang, "currentStatus")}: {status}</p>
      <Link href="/">{tServer(lang, "backToStores")}</Link>
    </main>
  );
}
