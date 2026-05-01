import { cookies } from "next/headers";
import en from "../locales/en/common.json";
import ar from "../locales/ar/common.json";
import type { Lang } from "./i18n";

const messages = { en, ar } as const;

export function getServerLang(): Lang {
  const lang = cookies().get("sweet-shop-lang")?.value;
  return lang === "ar" ? "ar" : "en";
}

export function tServer(lang: Lang, key: keyof typeof en): string {
  return messages[lang][key];
}
