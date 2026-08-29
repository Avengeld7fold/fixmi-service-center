import type { Dictionary, Locale } from "./types";
import { idDictionary } from "./dictionaries/id";
import { enDictionary } from "./dictionaries/en";

export function getDictionary(locale: Locale = "id"): Dictionary {
  return locale === "en" ? enDictionary : idDictionary;
}

export function isValidLocale(locale: string): locale is Locale {
  return locale === "id" || locale === "en";
}
