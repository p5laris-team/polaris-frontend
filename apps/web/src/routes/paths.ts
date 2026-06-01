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
  home: "/app/home",
  missions: "/app/missions",
  missionDetail: "/app/missions/:missionId",
  missionDetailPath: (missionId: number | string) => `/app/missions/${missionId}`,
  missionAnswer: "/app/missions/current/answer",
  missionResult: "/app/missions/current/result",
  character: "/app/character",
  shop: "/app/shop",
  inventory: "/app/inventory",
  wallet: "/app/wallet",
  share: "/app/share",
  attendance: "/app/attendance",
  notifications: "/app/notifications",
  myPage: "/app/me",
  designSystem: "/dev/design-system",
  testError: "/dev/test-error",
};

