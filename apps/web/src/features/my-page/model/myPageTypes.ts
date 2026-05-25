/**
 * 마이페이지 계정 API 타입입니다.
 * 사용자 프로필과 로그아웃 결과처럼 계정 영역에서만 쓰는 응답을 모아 둡니다.
 */

/** 사용자 계정 상태 enum입니다. ACTIVE는 정상, INACTIVE는 휴면, DELETED는 탈퇴 처리 상태입니다. */
export type MyPageUserStatus = "ACTIVE" | "INACTIVE" | "DELETED";

/** 마이페이지에 표시할 사용자 기본 정보입니다. */
export type MyPageUser = {
  id: number;
  email: string;
  nickname: string;
  provider: "GOOGLE";
  role: "USER";
  status: MyPageUserStatus;
};

/** 로그아웃 API 결과입니다. 클라이언트는 실패하더라도 로컬 세션을 정리합니다. */
export type LogoutResult = {
  loggedOut: boolean;
};
