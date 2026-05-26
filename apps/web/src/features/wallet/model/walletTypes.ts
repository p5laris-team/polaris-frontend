/**
 * 별조각 지갑 타입입니다.
 * 거래 사유 enum은 화면 라벨, 아이콘, 포트폴리오상 정합성 설명의 근거가 됩니다.
 */
import { type CursorPage } from "@/shared/api";

export type WalletTransactionReason =
  // 미션 완료 보상으로 별조각을 얻은 거래입니다.
  | "MISSION_REWARD"
  // 출석 체크 보상으로 별조각을 얻은 거래입니다.
  | "ATTENDANCE_REWARD"
  // 공유 보상으로 별조각을 얻은 거래입니다.
  | "SHARE_REWARD"
  // 상점에서 아이템을 구매하며 별조각을 사용한 거래입니다.
  | "ITEM_PURCHASE"
  // 돌봄 액션에 따른 보상/차감이 생길 때 쓰는 거래입니다.
  | "CARE_ACTION";

/** 현재 지갑 잔액 응답입니다. */
export type WalletSummaryResponse = {
  starPiece: number;
  updatedAt: string;
};

/** 별조각 거래 한 건입니다. amount가 양수면 획득, 음수면 사용입니다. */
export type WalletTransaction = {
  id: number;
  amount: number;
  balanceAfter: number;
  reason: WalletTransactionReason;
  description: string;
  sourceType: string | null;
  sourceId: number | null;
  occurredAt: string;
};

/** 거래내역 조회 요청입니다. cursor 기반으로 대량 거래 내역을 이어 불러올 수 있습니다. */
export type WalletTransactionsRequest = {
  cursor?: string | null;
  size: number;
};

/** cursor 기반 거래내역 응답입니다. */
export type WalletTransactionsResponse = CursorPage<WalletTransaction>;
