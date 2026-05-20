import { demoAuthUser } from "@/features/auth/model/authFixtures";
import { type MyPageUser } from "@/features/my-page/model/myPageTypes";

export function getDemoMyPageUser(): MyPageUser {
  // API 명세의 users/me 응답에는 로그인 세션의 user보다 status가 하나 더 있어서 fixture에서 보강한다.
  return {
    ...demoAuthUser,
    status: "ACTIVE",
  };
}
