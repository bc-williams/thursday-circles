"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    google?: typeof google;
  }
}

let googleMapsScriptLoadingPromise: Promise<void> | null = null;

export function useGoogleMaps() {
  const hasApiKey = Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);

  const [isLoaded, setIsLoaded] = useState(
    () => typeof window !== "undefined" && Boolean(window.google?.maps?.places)
  );
  const [loadError, setLoadError] = useState<string | null>(
    () => (hasApiKey ? null : "Missing Google Maps API key.")
  );

  useEffect(() => {
    if (typeof window === "undefined" || window.google?.maps?.places || !hasApiKey) {
      return;
    }

    if (!googleMapsScriptLoadingPromise) {
      googleMapsScriptLoadingPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector(
          'script[data-google-maps="true"]'
        ) as HTMLScriptElement | null;

        if (existing) {
          existing.addEventListener("load", () => resolve());
          existing.addEventListener("error", () =>
            reject(new Error("Failed to load Google Maps script."))
          );
          return;
        }

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.dataset.googleMaps = "true";

        script.onload = () => resolve();
        script.onerror = () =>
          reject(new Error("Failed to load Google Maps script."));

        document.head.appendChild(script);
      });
    }

    googleMapsScriptLoadingPromise
      .then(() => setIsLoaded(true))
      .catch((error) => {
        console.error(error);
        setLoadError("Failed to load Google Maps.");
      });
  }, [hasApiKey]);

  return { isLoaded, loadError };
}