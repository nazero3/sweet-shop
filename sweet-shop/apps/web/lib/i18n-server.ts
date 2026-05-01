import en from "../locales/en/common.json";
import ar from "../locales/ar/common.json";
import type { Lang } from "./i18n";

const messages = { en, ar } as const;

export function getServerLang(): Lang {
  return "en";
}

export function tServer(lang: Lang, key: keyof typeof en): string {
  return messages[lang][key];
}
