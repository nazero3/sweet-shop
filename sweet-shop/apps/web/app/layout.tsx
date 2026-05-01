import type { Metadata } from "next";
import "./globals.css";
import LanguageSwitcher from "../components/language-switcher";

export const metadata: Metadata = {
  title: "Sweet Shop | Multi-State Online Ordering",
  description: "Order sweets online for delivery or pickup across all Sweet Shop stores."
};

export default function RootLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <html lang="en">
      <body style={{ padding: 12 }}>
        <LanguageSwitcher />
        {children}
      </body>
    </html>
  );
}
