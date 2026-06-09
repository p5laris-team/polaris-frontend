/**
 * 공유 카드 생성과 공유 보상 기록 타입입니다.
 * 이미지 업로드, 카드 생성, 공유 이벤트 기록이 분리되어 있어 각 단계의 응답을 따로 둡니다.
 */

/** 프론트에서 만든 카드 이미지를 업로드할 presigned URL과 최종 공개 이미지 URL입니다. */
export type PresignedUrlResponse = {
  presignedUrl: string;
  imageUrl: string;
};

/** 업로드된 이미지 URL로 공유 카드를 생성하는 요청입니다. */
export type CreateShareCardRequest = {
  characterId: number;
  headline: string;
  imageUrl: string;
};

/** 공유 카드 생성 결과입니다. shareUrl은 사용자가 실제로 공유할 링크입니다. */
export type ShareCardResponse = {
  shareCardId: number;
  shareId: string;
  imageUrl: string;
  shareUrl: string;
};

/** 인증 없이 공개 공유 링크에서 조회하는 카드 정보입니다. */
export type ShareLinkResponse = {
  shareId: string;
  characterName: string;
  imageUrl: string;
  headline: string;
  signupUrl: string;
};

/** 공개 공유 링크 방문/CTA 클릭 로그 요청입니다. */
export type RecordShareClickRequest = {
  shareId: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

/** 공개 공유 링크 클릭 로그 응답입니다. */
export type ShareClickResponse = {
  shareId: string;
  recorded: boolean;
};

/** 공유를 시도한 플랫폼입니다. Web Share API와 클립보드 fallback을 구분합니다. */
export type SharePlatform = "WEB_SHARE" | "CLIPBOARD";

/** 공유 방식입니다. 보상 중복 방지 로그에서 어떤 행동을 했는지 남깁니다. */
export type ShareType = "WEB_SHARE_API" | "LINK_COPY";

/** 공유 이벤트 기록 요청입니다. idempotencyKey로 같은 카드의 보상 중복 지급을 막습니다. */
export type CreateShareEventRequest = {
  shareCardId: number;
  platform: SharePlatform;
  shareType: ShareType;
  idempotencyKey: string;
};

/** 공유 이벤트 결과입니다. rewardPaid=false면 이미 오늘 보상을 받은 상태입니다. */
export type ShareEventResponse = {
  shareEventId: number;
  rewardPaid: boolean;
  rewardStarPiece: number;
  wallet: {
    starPiece: number;
  };
};

/** 오늘 공유 보상 수령 여부입니다. */
export type TodayShareStatusResponse = {
  rewardClaimed: boolean;
  lastSharedAt: string | null;
};
