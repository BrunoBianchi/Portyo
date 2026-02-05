import { HydratedRouter } from "react-router/dom";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { initI18n } from "./i18n";

if (import.meta.env.DEV && "serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
  if ("caches" in window) {
    caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
  }
}

initI18n().finally(() => {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <HydratedRouter />
      </StrictMode>
    );
  });
});
