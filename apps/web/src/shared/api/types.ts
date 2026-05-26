/**
 * 백엔드 공통 에러 응답 타입입니다.
 * 화면에서는 code로 분기하고 message는 사용자 안내 문구의 기본값으로 사용합니다.
 */
export type ApiError = {
  timestamp: string;
  status: number;
  code: string;
  message: string;
  path: string;
  retryAfterSeconds?: number;
};

/**
 * 백엔드 REST API가 공통으로 감싸서 내려주는 응답 포맷입니다.
 */
export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error: ApiError | null;
};

/**
 * cursor 기반 목록 조회의 페이지 정보입니다.
 */
export type PageInfo = {
  nextCursor: string | number | null;
  hasNext: boolean;
  size: number;
};

/**
 * 알림, 지갑 거래, 아이템 목록처럼 여러 건을 cursor pagination으로 받는 응답 타입입니다.
 */
export type CursorPage<T> = {
  items: T[];
  pageInfo: PageInfo;
};
