import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import { useBannerAdConfigQuery } from "@/features/ad/api/adApi";
import { type BannerAdConfig } from "@/features/ad/model/adTypes";
import { routes } from "@/routes/paths";
import { runtimeConfig } from "@/shared/config/env";

import "./BottomWebAdBanner.css";

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

const ADSENSE_SCRIPT_ID = "polaris-adsense-script";
const ADSENSE_SCRIPT_BASE_URL = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
const DEFAULT_RESERVED_HEIGHT = 64;

const sensitivePathPrefixes = [
  routes.login,
  routes.googleCallback,
  "/signup",
  "/payment",
  "/payments",
  routes.onboardingCharacter,
  routes.onboardingCharacterName,
  routes.onboardingQuestions,
  routes.missionAnswer,
];

function isSensitivePath(pathname: string) {
  return sensitivePathPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function hasAdsenseFields(config: BannerAdConfig | null | undefined) {
  return Boolean(
    config?.enabled &&
      config.provider === "ADSENSE" &&
      config.clientId &&
      config.slotId &&
      config.layout === "BOTTOM_FIXED",
  );
}

function isEditableElement(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toLowerCase();
  return tagName === "input" || tagName === "textarea" || target.isContentEditable;
}

function useKeyboardVisible() {
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const visualViewport = window.visualViewport;
    const initialHeight = visualViewport?.height ?? window.innerHeight;

    const updateByViewport = () => {
      if (!visualViewport) return;

      setKeyboardVisible(initialHeight - visualViewport.height > 120);
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (isEditableElement(event.target)) {
        setKeyboardVisible(true);
      }
    };

    const handleFocusOut = () => {
      window.setTimeout(() => {
        const activeElement = document.activeElement;
        setKeyboardVisible(isEditableElement(activeElement));
      }, 0);
    };

    visualViewport?.addEventListener("resize", updateByViewport);
    window.addEventListener("focusin", handleFocusIn);
    window.addEventListener("focusout", handleFocusOut);

    return () => {
      visualViewport?.removeEventListener("resize", updateByViewport);
      window.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  return keyboardVisible;
}

function loadAdsenseScript(clientId: string): Promise<void> {
  let currentScript = document.getElementById(ADSENSE_SCRIPT_ID) as HTMLScriptElement | null;

  if (!currentScript) {
    currentScript = document.querySelector<HTMLScriptElement>(
      `script[src^="${ADSENSE_SCRIPT_BASE_URL}"][src*="client=${encodeURIComponent(clientId)}"]`,
    );

    if (currentScript) {
      currentScript.id = ADSENSE_SCRIPT_ID;
      currentScript.dataset.clientId = clientId;
      currentScript.dataset.loaded = "true";
    }
  }

  if (currentScript?.dataset.clientId && currentScript.dataset.clientId !== clientId) {
    currentScript.remove();
    currentScript = null;
  }

  if (currentScript?.dataset.loaded === "true") {
    return Promise.resolve();
  }

  const loadingScript = currentScript;
  if (loadingScript?.dataset.loading === "true") {
    return new Promise((resolve, reject) => {
      loadingScript.addEventListener("load", () => resolve(), { once: true });
      loadingScript.addEventListener("error", () => reject(new Error("AdSense script load failed")), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = ADSENSE_SCRIPT_ID;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.dataset.clientId = clientId;
    script.dataset.loading = "true";
    script.src = `${ADSENSE_SCRIPT_BASE_URL}?client=${encodeURIComponent(clientId)}`;
    script.onload = () => {
      script.dataset.loading = "false";
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => {
      script.remove();
      reject(new Error("AdSense script load failed"));
    };

    document.head.appendChild(script);
  });
}

export function BottomWebAdBanner() {
  const location = useLocation();
  const path = `${location.pathname}${location.search}`;
  const sensitivePath = isSensitivePath(location.pathname);
  const shouldQueryConfig = !sensitivePath;
  const configQuery = useBannerAdConfigQuery({
    placement: "BOTTOM_WEB",
    path,
    enabled: shouldQueryConfig,
  });
  const config = configQuery.data ?? null;
  const [loadFailed, setLoadFailed] = useState(false);
  const [slotFilled, setSlotFilled] = useState(false);
  const [renderKey, setRenderKey] = useState(0);
  const containerRef = useRef<HTMLElement | null>(null);
  const adSlotRef = useRef<HTMLModElement | null>(null);
  const keyboardVisible = useKeyboardVisible();
  const reservedHeight = useMemo(
    () => Math.max(config?.reservedHeightPx ?? DEFAULT_RESERVED_HEIGHT, 0),
    [config?.reservedHeightPx],
  );
  const canRequestRealAd = runtimeConfig.ads.enableRealAdRequests;
  const hiddenByKeyboard = Boolean(config?.policy.hideOnKeyboardVisible && keyboardVisible);
  const shouldRender = hasAdsenseFields(config) && canRequestRealAd && !loadFailed && !hiddenByKeyboard;

  useEffect(() => {
    setLoadFailed(false);
    setSlotFilled(false);
    setRenderKey((key) => key + 1);
  }, [config?.clientId, config?.slotId, path]);

  useEffect(() => {
    if (!shouldRender || !slotFilled) return;

    const appShell = containerRef.current?.closest<HTMLElement>(".app-shell");
    if (!appShell) return;

    appShell.dataset.bottomWebAdVisible = "true";
    appShell.style.setProperty("--bottom-web-ad-reserved-height", `${reservedHeight}px`);

    return () => {
      delete appShell.dataset.bottomWebAdVisible;
      appShell.style.removeProperty("--bottom-web-ad-reserved-height");
    };
  }, [reservedHeight, shouldRender, slotFilled]);

  useEffect(() => {
    if (!shouldRender || !config?.clientId) return;

    let cancelled = false;

    loadAdsenseScript(config.clientId)
      .then(() => {
        if (cancelled) return;

        try {
          window.adsbygoogle = window.adsbygoogle ?? [];
          window.adsbygoogle.push({});
        } catch {
          setLoadFailed(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadFailed(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [config?.clientId, config?.slotId, renderKey, shouldRender]);

  useEffect(() => {
    if (!shouldRender || !config || config.refreshSeconds < 30) return;

    const intervalId = window.setInterval(() => {
      setRenderKey((key) => key + 1);
    }, config.refreshSeconds * 1000);

    return () => window.clearInterval(intervalId);
  }, [config, shouldRender]);

  useEffect(() => {
    if (!shouldRender) return;

    const adSlot = adSlotRef.current;
    if (!adSlot) return;

    const observer = new MutationObserver(() => {
      const adStatus = adSlot.getAttribute("data-ad-status");

      if (adStatus === "filled") {
        setSlotFilled(true);
      }

      if (adStatus === "unfilled") {
        setLoadFailed(true);
      }
    });

    observer.observe(adSlot, {
      attributes: true,
      attributeFilter: ["data-ad-status"],
    });

    const timeoutId = window.setTimeout(() => {
      const adStatus = adSlot.getAttribute("data-ad-status");

      if (adStatus === "filled") {
        setSlotFilled(true);
      }

      if (adStatus === "unfilled" || !adStatus) {
        setLoadFailed(true);
      }
    }, 8_000);

    return () => {
      observer.disconnect();
      window.clearTimeout(timeoutId);
    };
  }, [renderKey, shouldRender]);

  if (!shouldRender || !config?.clientId || !config.slotId) {
    return null;
  }

  return (
    <aside
      ref={containerRef}
      className={`bottom-web-ad ${slotFilled ? "bottom-web-ad--filled" : "bottom-web-ad--pending"}`}
      aria-label="광고"
      style={{ "--bottom-web-ad-height": `${reservedHeight}px` } as CSSProperties & Record<string, string>}
    >
      <ins
        key={renderKey}
        ref={adSlotRef}
        className="adsbygoogle bottom-web-ad__slot"
        data-ad-client={config.clientId}
        data-ad-slot={config.slotId}
        data-ad-format={config.format === "ANCHOR" ? "auto" : "horizontal"}
        data-full-width-responsive="true"
        style={{ display: "block", minHeight: reservedHeight }}
      />
    </aside>
  );
}
