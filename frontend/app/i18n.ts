import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./i18n/en.json";
import pt from "./i18n/pt.json";

const STORAGE_KEY = "portyo_lang";
const SUPPORTED_LANGUAGES = ["en", "pt"] as const;

type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const getInitialLanguage = (): SupportedLanguage => {
  if (typeof window === "undefined") return "en";

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED_LANGUAGES.includes(stored as SupportedLanguage)) {
    return stored as SupportedLanguage;
  }

  const browser = navigator.language?.split("-")[0];
  if (browser && SUPPORTED_LANGUAGES.includes(browser as SupportedLanguage)) {
    return browser as SupportedLanguage;
  }

  return "en";
};

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    lng: getInitialLanguage(),
    supportedLngs: SUPPORTED_LANGUAGES,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: { translation: en },
      pt: { translation: pt },
    },
    react: {
      useSuspense: true,
    },
  });

i18n.on("languageChanged", (lng) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, lng);
  document.documentElement.lang = lng;
});

export { STORAGE_KEY, SUPPORTED_LANGUAGES };
export default i18n;
