import en from "../locales/en/common.json";
import ar from "../locales/ar/common.json";
export type Lang = "en" | "ar";

const messages = {
  en,
  ar
} as const;

export function detectLang(): Lang {
  if (typeof window !== "undefined") {
    const fromStorage = window.localStorage.getItem("sweet-shop-lang");
    if (fromStorage === "en" || fromStorage === "ar") return fromStorage;
  }
  if (typeof navigator === "undefined") return "en";
  return navigator.language.toLowerCase().startsWith("ar") ? "ar" : "en";
}

export function setLang(lang: Lang): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("sweet-shop-lang", lang);
}

export function t(lang: Lang, key: keyof (typeof messages)["en"]): string {
  return messages[lang][key];
}
