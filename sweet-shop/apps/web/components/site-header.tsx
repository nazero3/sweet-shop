"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LanguageSwitcher from "./language-switcher";
import { detectLang, t, type Lang } from "../lib/i18n";

export default function SiteHeader(): React.ReactElement {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    setLang(detectLang());
  }, []);

  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Link href="/" className="brand">
          Sweet Shop
        </Link>
        <nav className="main-nav">
          <Link href="/stores">{t(lang, "navStores")}</Link>
          <Link href="/menu">{t(lang, "navMenu")}</Link>
          <Link href="/checkout">{t(lang, "navCheckout")}</Link>
        </nav>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
