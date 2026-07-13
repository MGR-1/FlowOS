// packages/core/src/i18n/index.ts
// Shared i18next instance (EN default, NL available). Resources are bundled
// at build time — no async backend, safe to use immediately after import.
//
// Platform-specific device-locale detection is intentionally NOT done here:
// this package is shared between the Expo app and the future Tauri desktop
// app (Developer Handbook §1.2), so it must stay platform-agnostic. Each app
// shell is responsible for calling `setLocale()` with the detected locale.
// TODO: wire expo-localization in apps/mobile once available (out of scope
// for Sprint 1 — spec only requires both languages to ship, not auto-detect).

import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { en, nl } from "./resources";

export type SupportedLocale = "en" | "nl";

if (!i18next.isInitialized) {
  i18next.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      nl: { translation: nl },
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
}

export function setLocale(locale: SupportedLocale) {
  return i18next.changeLanguage(locale);
}

export { i18next };
export default i18next;
