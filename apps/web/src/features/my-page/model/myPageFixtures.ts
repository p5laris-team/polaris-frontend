import { demoAuthUser } from "@/features/auth/model/authFixtures";
import {
  type MyPageUser,
  type SelectedWeatherRegionResponse,
  type UpdateWeatherRegionRequest,
  type WeatherRegionListResponse,
} from "@/features/my-page/model/myPageTypes";

const demoWeatherRegions: WeatherRegionListResponse = {
  regions: [
    { regionCode: "SEOUL", displayName: "서울" },
    { regionCode: "GYEONGGI_NORTH", displayName: "경기 북부" },
    { regionCode: "GYEONGGI_SOUTH", displayName: "경기 남부" },
    { regionCode: "INCHEON", displayName: "인천" },
    { regionCode: "BUSAN", displayName: "부산" },
    { regionCode: "DAEGU", displayName: "대구" },
    { regionCode: "GWANGJU", displayName: "광주" },
    { regionCode: "DAEJEON", displayName: "대전" },
    { regionCode: "ULSAN", displayName: "울산" },
    { regionCode: "JEJU", displayName: "제주" },
  ],
};

let demoSelectedWeatherRegion: SelectedWeatherRegionResponse = {
  selected: true,
  regionCode: "SEOUL",
  displayName: "서울",
};

export function getDemoMyPageUser(): MyPageUser {
  // API 명세의 users/me 응답에는 로그인 세션의 user보다 status가 하나 더 있어서 fixture에서 보강한다.
  return {
    ...demoAuthUser,
    status: "ACTIVE",
  };
}

export function demoListWeatherRegions(): WeatherRegionListResponse {
  return demoWeatherRegions;
}

export function demoGetMyWeatherRegion(): SelectedWeatherRegionResponse {
  return demoSelectedWeatherRegion;
}

export function demoUpdateMyWeatherRegion(
  body: UpdateWeatherRegionRequest,
): SelectedWeatherRegionResponse {
  const region = demoWeatherRegions.regions.find((item) => item.regionCode === body.regionCode);

  if (!region) {
    throw new Error("선택한 지역을 찾지 못했어요.");
  }

  demoSelectedWeatherRegion = {
    selected: true,
    regionCode: region.regionCode,
    displayName: region.displayName,
  };

  return demoSelectedWeatherRegion;
}
