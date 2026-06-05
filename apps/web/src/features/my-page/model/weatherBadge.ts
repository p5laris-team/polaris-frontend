import { type WeatherAssetKey } from "@/shared/assets/polarisAssets";

export type ClientWeatherBadgeKey =
  | "sunny"
  | "cloudy"
  | "rain"
  | "snow"
  | "hot"
  | "cold"
  | "night"
  | "midnight";

export type ClientWeatherBadgeSource = "live" | "fallback" | "preview";

export type ClientWeatherBadge = {
  key: ClientWeatherBadgeKey;
  assetKey: WeatherAssetKey;
  description: string;
  source: ClientWeatherBadgeSource;
};

type WeatherRegionCoordinate = {
  latitude: number;
  longitude: number;
};

type OpenMeteoCurrentWeather = {
  current?: {
    is_day?: number;
    precipitation?: number;
    rain?: number;
    snowfall?: number;
    temperature_2m?: number;
    weather_code?: number;
  };
};

const WEATHER_BADGES: Record<ClientWeatherBadgeKey, Omit<ClientWeatherBadge, "source">> = {
  sunny: {
    key: "sunny",
    assetKey: "sunny",
    description: "맑은 날의 가벼운 미션 분위기로 보여줘요.",
  },
  cloudy: {
    key: "cloudy",
    assetKey: "cloudy",
    description: "흐린 날에도 부담 없는 미션 분위기로 보여줘요.",
  },
  rain: {
    key: "rain",
    assetKey: "rain",
    description: "비 오는 날의 차분한 미션 분위기로 보여줘요.",
  },
  snow: {
    key: "snow",
    assetKey: "snow",
    description: "눈 오는 날의 포근한 미션 분위기로 보여줘요.",
  },
  hot: {
    key: "hot",
    assetKey: "hot",
    description: "더운 날엔 짧고 시원한 미션 분위기로 보여줘요.",
  },
  cold: {
    key: "cold",
    assetKey: "cold",
    description: "추운 날엔 몸을 천천히 푸는 미션 분위기로 보여줘요.",
  },
  night: {
    key: "night",
    assetKey: "night",
    description: "밤에는 조용히 마무리하는 미션 분위기로 보여줘요.",
  },
  midnight: {
    key: "midnight",
    assetKey: "midnight",
    description: "늦은 시간엔 쉬어 가는 미션 분위기로 보여줘요.",
  },
};

const WEATHER_REGION_COORDINATES: Record<string, WeatherRegionCoordinate> = {
  SEOUL: { latitude: 37.5665, longitude: 126.978 },
  BUSAN: { latitude: 35.1796, longitude: 129.0756 },
  DAEGU: { latitude: 35.8714, longitude: 128.6014 },
  INCHEON: { latitude: 37.4563, longitude: 126.7052 },
  GWANGJU: { latitude: 35.1595, longitude: 126.8526 },
  DAEJEON: { latitude: 36.3504, longitude: 127.3845 },
  ULSAN: { latitude: 35.5384, longitude: 129.3114 },
  SEJONG: { latitude: 36.48, longitude: 127.289 },
  GYEONGGI_NORTH: { latitude: 37.7381, longitude: 127.0337 },
  GYEONGGI_SOUTH: { latitude: 37.2636, longitude: 127.0286 },
  GYEONGGI_EAST: { latitude: 37.298, longitude: 127.6371 },
  GYEONGGI_WEST: { latitude: 37.6152, longitude: 126.7156 },
  GANGWON_YEONGSEO_NORTH: { latitude: 37.8813, longitude: 127.7298 },
  GANGWON_YEONGSEO_SOUTH: { latitude: 37.3422, longitude: 127.9202 },
  GANGWON_YEONGDONG_NORTH: { latitude: 38.207, longitude: 128.5918 },
  GANGWON_YEONGDONG_SOUTH: { latitude: 37.7519, longitude: 128.8761 },
  CHUNGBUK_NORTH: { latitude: 36.991, longitude: 127.9259 },
  CHUNGBUK_CENTRAL: { latitude: 36.6424, longitude: 127.489 },
  CHUNGBUK_SOUTH: { latitude: 36.1748, longitude: 127.7766 },
  CHUNGNAM_NORTH: { latitude: 36.8151, longitude: 127.1139 },
  CHUNGNAM_INLAND: { latitude: 36.4465, longitude: 127.119 },
  CHUNGNAM_WEST_COAST: { latitude: 36.7845, longitude: 126.4503 },
  CHUNGNAM_SOUTH: { latitude: 36.1871, longitude: 127.0987 },
  JEONBUK_NORTH: { latitude: 35.8242, longitude: 127.148 },
  JEONBUK_WEST_COAST: { latitude: 35.9676, longitude: 126.7368 },
  JEONBUK_EAST: { latitude: 36.0068, longitude: 127.6608 },
  JEONBUK_SOUTH: { latitude: 35.4164, longitude: 127.3904 },
  JEONNAM_WEST: { latitude: 34.8118, longitude: 126.3922 },
  JEONNAM_INLAND: { latitude: 35.0161, longitude: 126.7108 },
  JEONNAM_EAST: { latitude: 34.9506, longitude: 127.4872 },
  JEONNAM_SOUTH_COAST: { latitude: 34.7604, longitude: 127.6622 },
  GYEONGBUK_NORTH: { latitude: 36.5684, longitude: 128.7294 },
  GYEONGBUK_SOUTH: { latitude: 36.1195, longitude: 128.3446 },
  GYEONGBUK_EAST_COAST: { latitude: 36.019, longitude: 129.3435 },
  GYEONGBUK_NORTHEAST: { latitude: 36.8057, longitude: 128.6241 },
  GYEONGNAM_WEST: { latitude: 35.18, longitude: 128.1076 },
  GYEONGNAM_EAST: { latitude: 35.2285, longitude: 128.8894 },
  GYEONGNAM_SOUTH_COAST: { latitude: 34.8544, longitude: 128.4332 },
  GYEONGNAM_NORTH: { latitude: 35.6866, longitude: 127.9095 },
  JEJU_NORTH: { latitude: 33.4996, longitude: 126.5312 },
  JEJU_SOUTH: { latitude: 33.2541, longitude: 126.5601 },
  JEJU_EAST: { latitude: 33.4507, longitude: 126.918 },
  JEJU_WEST: { latitude: 33.393, longitude: 126.263 },
};

const WEATHER_BADGE_CACHE_TTL_MS = 20 * 60 * 1000;

export function resolveFallbackWeatherBadge(now = new Date()): ClientWeatherBadge {
  const previewBadge = getPreviewWeatherBadge();
  if (previewBadge) {
    return previewBadge;
  }

  return withSource(resolveTimeWeatherBadge(now), "fallback");
}

export async function fetchClientWeatherBadge(
  regionCode: string | null | undefined,
  options: { signal?: AbortSignal; now?: Date } = {},
): Promise<ClientWeatherBadge> {
  const previewBadge = getPreviewWeatherBadge();
  if (previewBadge) {
    return previewBadge;
  }

  const normalizedRegionCode = normalizeRegionCode(regionCode);
  const coordinate = normalizedRegionCode ? WEATHER_REGION_COORDINATES[normalizedRegionCode] : null;

  if (!normalizedRegionCode || !coordinate) {
    return resolveFallbackWeatherBadge(options.now);
  }

  const cached = readWeatherBadgeCache(normalizedRegionCode);
  if (cached) {
    return cached;
  }

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(coordinate.latitude));
  url.searchParams.set("longitude", String(coordinate.longitude));
  url.searchParams.set(
    "current",
    "temperature_2m,is_day,precipitation,rain,snowfall,weather_code",
  );
  url.searchParams.set("timezone", "Asia/Seoul");
  url.searchParams.set("forecast_days", "1");

  const response = await fetch(url, {
    signal: options.signal,
  });

  if (!response.ok) {
    throw new Error("날씨 배지를 불러오지 못했어요.");
  }

  const data = (await response.json()) as OpenMeteoCurrentWeather;
  const badge = resolveOpenMeteoWeatherBadge(data.current, options.now ?? new Date());

  writeWeatherBadgeCache(normalizedRegionCode, badge);

  return badge;
}

function resolveOpenMeteoWeatherBadge(
  current: OpenMeteoCurrentWeather["current"],
  now: Date,
): ClientWeatherBadge {
  const weatherCode = current?.weather_code;
  const temperature = current?.temperature_2m;
  const isDay = current?.is_day !== 0;
  const precipitation = Math.max(
    0,
    current?.precipitation ?? 0,
    current?.rain ?? 0,
    current?.snowfall ?? 0,
  );

  if (typeof weatherCode === "number" && isSnowWeatherCode(weatherCode)) {
    return withSource("snow", "live");
  }

  if (
    precipitation > 0.1 ||
    (typeof weatherCode === "number" && isRainWeatherCode(weatherCode))
  ) {
    return withSource("rain", "live");
  }

  if (typeof temperature === "number" && temperature >= 30) {
    return withSource("hot", "live");
  }

  if (typeof temperature === "number" && temperature <= 0) {
    return withSource("cold", "live");
  }

  if (!isDay) {
    return withSource(now.getHours() >= 0 && now.getHours() < 5 ? "midnight" : "night", "live");
  }

  if (typeof weatherCode === "number" && isCloudWeatherCode(weatherCode)) {
    return withSource("cloudy", "live");
  }

  return withSource("sunny", "live");
}

function resolveTimeWeatherBadge(now: Date): ClientWeatherBadgeKey {
  const hour = now.getHours();
  const month = now.getMonth() + 1;

  if (hour >= 0 && hour < 5) return "midnight";
  if (hour >= 19 || hour < 7) return "night";
  if (month === 12 || month <= 2) return "cold";
  if (month >= 7 && month <= 8) return "hot";

  return "sunny";
}

function isSnowWeatherCode(weatherCode: number) {
  return (
    weatherCode === 71 ||
    weatherCode === 73 ||
    weatherCode === 75 ||
    weatherCode === 77 ||
    weatherCode === 85 ||
    weatherCode === 86
  );
}

function isRainWeatherCode(weatherCode: number) {
  return (
    (weatherCode >= 51 && weatherCode <= 67) ||
    (weatherCode >= 80 && weatherCode <= 82) ||
    (weatherCode >= 95 && weatherCode <= 99)
  );
}

function isCloudWeatherCode(weatherCode: number) {
  return weatherCode === 2 || weatherCode === 3 || weatherCode === 45 || weatherCode === 48;
}

function getPreviewWeatherBadge() {
  const previewKey = normalizeBadgeKey(readPreviewBadgeKey());

  return previewKey ? withSource(previewKey, "preview") : null;
}

function readPreviewBadgeKey() {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    new URLSearchParams(window.location.search).get("weatherBadge") ??
    window.localStorage.getItem("polaris.weatherBadge.preview")
  );
}

function normalizeBadgeKey(value: string | null | undefined): ClientWeatherBadgeKey | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase().replace(/-/g, "");

  if (normalized === "clear" || normalized === "sun") return "sunny";
  if (normalized === "cloud" || normalized === "overcast") return "cloudy";
  if (normalized === "rainy" || normalized === "shower") return "rain";
  if (normalized === "snowy") return "snow";
  if (normalized === "heat") return "hot";
  if (normalized === "freezing") return "cold";
  if (normalized === "late") return "midnight";

  if (normalized in WEATHER_BADGES) {
    return normalized as ClientWeatherBadgeKey;
  }

  return null;
}

function normalizeRegionCode(regionCode: string | null | undefined) {
  return regionCode?.trim().toUpperCase() || null;
}

function withSource(
  key: ClientWeatherBadgeKey,
  source: ClientWeatherBadgeSource,
): ClientWeatherBadge {
  return {
    ...WEATHER_BADGES[key],
    source,
  };
}

function readWeatherBadgeCache(regionCode: string): ClientWeatherBadge | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.sessionStorage.getItem(getWeatherBadgeCacheKey(regionCode));
    if (!rawValue) {
      return null;
    }

    const cached = JSON.parse(rawValue) as { badge?: ClientWeatherBadge; cachedAt?: number };
    if (!cached.badge || !cached.cachedAt) {
      return null;
    }

    if (Date.now() - cached.cachedAt > WEATHER_BADGE_CACHE_TTL_MS) {
      return null;
    }

    return cached.badge;
  } catch {
    return null;
  }
}

function writeWeatherBadgeCache(regionCode: string, badge: ClientWeatherBadge) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(
      getWeatherBadgeCacheKey(regionCode),
      JSON.stringify({
        badge,
        cachedAt: Date.now(),
      }),
    );
  } catch {
    // 캐시는 실패해도 화면 표시와 무관하다.
  }
}

function getWeatherBadgeCacheKey(regionCode: string) {
  return `polaris.weatherBadge.${regionCode}`;
}
