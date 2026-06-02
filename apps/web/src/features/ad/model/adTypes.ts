export type AdPlacement = "BOTTOM_WEB" | "BOTTOM_HOME" | "BOTTOM_MISSION" | "BOTTOM_CHARACTER";

export type AdProvider = "ADSENSE";

export type AdFormat = "ANCHOR" | "DISPLAY_BANNER";

export type AdLayout = "BOTTOM_FIXED" | "INLINE_BOTTOM";

export type BannerAdPolicy = {
  hideOnPaidUser: boolean;
  hideOnKeyboardVisible: boolean;
  hideOnSensitiveScreen: boolean;
};

export type BannerAdConfig = {
  enabled: boolean;
  placement: AdPlacement;
  provider: AdProvider;
  clientId: string | null;
  slotId: string | null;
  format: AdFormat;
  layout: AdLayout;
  refreshSeconds: number;
  reservedHeightPx: number;
  policy: BannerAdPolicy;
};
