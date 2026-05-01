"use client";

import { useEffect, useState } from "react";
import { detectLang, setLang, t, type Lang } from "../lib/i18n";

export default function LanguageSwitcher(): React.ReactElement {
  const [lang, setCurrentLang] = useState<Lang>("en");

  useEffect(() => {
    setCurrentLang(detectLang());
  }, []);

  function toggle(): void {
    const next = lang === "en" ? "ar" : "en";
    setLang(next);
    setCurrentLang(next);
    document.cookie = `sweet-shop-lang=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    window.location.reload();
  }

  return (
    <button onClick={toggle} type="button" style={{ margin: "12px 0" }}>
      {t(lang, "switchLanguage")}
    </button>
  );
}
