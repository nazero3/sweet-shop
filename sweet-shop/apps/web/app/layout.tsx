import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "../components/site-header";

export const metadata: Metadata = {
  title: "Sweet Shop | Multi-State Online Ordering",
  description: "Order sweets online for delivery or pickup across all Sweet Shop stores."
};

export default function RootLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <div className="container page-wrap">{children}</div>
      </body>
    </html>
  );
}
