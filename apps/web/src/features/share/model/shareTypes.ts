export type PresignedUrlResponse = {
  presignedUrl: string;
  imageUrl: string;
};

export type CreateShareCardRequest = {
  characterId: number;
  imageUrl: string;
};

export type ShareCardResponse = {
  shareCardId: number;
  shareId: string;
  imageUrl: string;
  shareUrl: string;
};

export type SharePlatform = "WEB_SHARE" | "CLIPBOARD";
export type ShareType = "WEB_SHARE_API" | "LINK_COPY";

export type CreateShareEventRequest = {
  shareCardId: number;
  platform: SharePlatform;
  shareType: ShareType;
  idempotencyKey: string;
};

export type ShareEventResponse = {
  shareEventId: number;
  rewardPaid: boolean;
  rewardStarPiece: number;
  wallet: {
    starPiece: number;
  };
};

export type TodayShareStatusResponse = {
  rewardClaimed: boolean;
  lastSharedAt: string | null;
};
