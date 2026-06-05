/**
 * 앱에서 사용하는 URL 경로 모음입니다.
 * 새 화면을 추가할 때는 문자열을 직접 흩뿌리지 말고 이 객체에 먼저 등록합니다.
 */
export const routes = {
  login: "/login",
  googleCallback: "/oauth/google/callback",
  onboardingCharacter: "/onboarding/character",
  onboardingCharacterName: "/onboarding/character-name",
  onboardingQuestions: "/onboarding/questions",
  onboardingMissionEdit: "/app/me/onboarding",
  home: "/app/home",
  missions: "/app/missions",
  missionDetail: "/app/missions/:missionId",
  missionDetailPath: (missionId: number | string) => `/app/missions/${missionId}`,
  missionAnswer: "/app/missions/current/answer",
  missionResult: "/app/missions/current/result",
  character: "/app/character",
  characterTalk: "/app/character/talk",
  shop: "/app/shop",
  shopCareItemPath: (effectType: string) =>
    `/app/shop?category=consumable&effectType=${encodeURIComponent(effectType)}`,
  inventory: "/app/inventory",
  wallet: "/app/wallet",
  share: "/app/share",
  publicShare: "/share/:shareId",
  publicSharePath: (shareId: string) => `/share/${shareId}`,
  attendance: "/app/attendance",
  notifications: "/app/notifications",
  myPage: "/app/me",
  designSystem: "/dev/design-system",
  testError: "/dev/test-error",
};
