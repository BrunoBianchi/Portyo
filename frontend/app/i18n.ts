import i18n from "i18next";
import { initReactI18next } from "react-i18next";

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

const isServer = import.meta.env.SSR ?? typeof window === "undefined";
let initPromise: Promise<typeof i18n> | null = null;

export const initI18n = async () => {
  if (i18n.isInitialized) return i18n;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const Backend = isServer
      ? (await import("i18next-fs-backend")).default
      : (await import("i18next-http-backend")).default;

    let serverLoadPath: string | undefined;
    if (isServer) {
      const { resolve } = await import("node:path");
      const { fileURLToPath } = await import("node:url");
      const appDir = fileURLToPath(new URL(".", import.meta.url));
      serverLoadPath = resolve(appDir, "..", "public", "i18n", "{{lng}}", "{{ns}}.json");
    }

    const backendOptions = isServer
      ? { loadPath: serverLoadPath }
      : { loadPath: "/i18n/{{lng}}/{{ns}}.json" };

    await i18n
      .use(Backend)
      .use(initReactI18next)
      .init({
        fallbackLng: "en",
        lng: getInitialLanguage(),
        supportedLngs: SUPPORTED_LANGUAGES,
        ns: [
          "nav",
          "meta",
          "themes",
          "dashboard",
          "auth",
          "home",
          "aboutPage",
          "termsPage",
          "privacyPage",
          "pricingPage",
          "blogPage",
          "footer",
          "builtForEveryone",
          "tooltips",
        ],
        defaultNS: "nav",
        nsSeparator: ".",
        interpolation: {
          escapeValue: false,
        },
        preload: isServer ? [...SUPPORTED_LANGUAGES] : undefined,
        initImmediate: !isServer,
        backend: backendOptions,
        react: {
          useSuspense: true,
        },
      });

    return i18n;
  })();

  return initPromise;
};

void initI18n();

i18n.on("languageChanged", (lng) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, lng);
  document.documentElement.lang = lng;
});

export { STORAGE_KEY, SUPPORTED_LANGUAGES };
export default i18n;
