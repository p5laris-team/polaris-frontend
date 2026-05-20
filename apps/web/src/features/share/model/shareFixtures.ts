import { demoApplyShareReward } from "@/features/home/model/homeFixture";
import {
  type CreateShareCardRequest,
  type CreateShareEventRequest,
  type PresignedUrlResponse,
  type ShareCardResponse,
  type ShareEventResponse,
  type TodayShareStatusResponse,
} from "@/features/share/model/shareTypes";

const SHARE_REWARD_STAR_PIECE = 10;

let nextShareCardId = 800;
let nextShareEventId = 810;
let demoTodayShareStatus: TodayShareStatusResponse = {
  rewardClaimed: false,
  lastSharedAt: null,
};

export function demoGetPresignedUrl(): PresignedUrlResponse {
  return {
    presignedUrl: "https://upload.polaris.local/share-cards/demo-card.png",
    imageUrl: `https://cdn.polaris.app/share-cards/demo-${Date.now()}.png`,
  };
}

export function demoCreateShareCard(body: CreateShareCardRequest): ShareCardResponse {
  const shareCardId = nextShareCardId;
  nextShareCardId += 1;

  return {
    shareCardId,
    shareId: `sh_demo_${shareCardId}`,
    imageUrl: body.imageUrl,
    shareUrl: `https://polaris.app/share/sh_demo_${shareCardId}`,
  };
}

export function demoCreateShareEvent(_body: CreateShareEventRequest): ShareEventResponse {
  const rewardPaid = !demoTodayShareStatus.rewardClaimed;
  const wallet = rewardPaid
    ? demoApplyShareReward(SHARE_REWARD_STAR_PIECE)
    : { starPiece: demoApplyShareReward(0).starPiece };

  demoTodayShareStatus = {
    rewardClaimed: true,
    lastSharedAt: new Date().toISOString(),
  };

  const shareEventId = nextShareEventId;
  nextShareEventId += 1;

  return {
    shareEventId,
    rewardPaid,
    rewardStarPiece: rewardPaid ? SHARE_REWARD_STAR_PIECE : 0,
    wallet,
  };
}

export function demoGetTodayShareStatus(): TodayShareStatusResponse {
  return { ...demoTodayShareStatus };
}
