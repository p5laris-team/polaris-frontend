/**
 * 별친구 대화/상호작용 API 타입입니다.
 * 캐릭터 상세 화면에서 터치 대사, 기억 조각 해금, SSE 대화 스트림을 표현할 때 사용합니다.
 */

export type CharacterInteractionType =
  | "TAP"
  | "LEVEL_UP"
  | "LOW_HUNGER"
  | "LOW_ENERGY"
  | "LOW_AFFECTION"
  | "NIGHT"
  | "MIDNIGHT";

export type CharacterInteractionRequest = {
  interactionType?: CharacterInteractionType;
};

export type CharacterInteractionMemory = {
  memoryKey: string;
  title: string;
  storyText: string;
};

export type CharacterInteractionResponse = {
  characterId: number;
  characterTypeCode: string;
  level: number;
  fragmentType: "COMMON" | "LORE" | "EASTER_EGG" | string;
  triggerType: CharacterInteractionType | string;
  message: string;
  interpretation: string;
  memoryUnlocked: boolean;
  alreadyUnlocked: boolean;
  memory: CharacterInteractionMemory | null;
};

export type CharacterTalkStreamRequest = {
  message: string;
  interactionType?: CharacterInteractionType;
  sessionId?: string | null;
};

export type CharacterTalkMeta = {
  requestId: string;
  characterId: number;
  characterTypeCode: string;
  level: number;
  sessionId?: string;
  newSession?: boolean;
  historyWindowTurns?: number;
  memoryHitCount?: number;
  talkStatus: "AVAILABLE" | "LIMIT_EXCEEDED" | "UNAVAILABLE" | string;
  dailyLimit: number;
  remainingCount: number | null;
  limitExceeded: boolean;
  resetAt?: string;
  sentAt?: string;
};

export type CharacterTalkDone = {
  requestId: string;
  sessionId?: string;
  fallbackUsed: boolean;
  errorType?: string;
  talkStatus: "AVAILABLE" | "LIMIT_EXCEEDED" | "UNAVAILABLE" | string;
  dailyLimit: number;
  remainingCount: number | null;
  limitExceeded: boolean;
  resetAt?: string;
  memoryHitCount?: number;
};

export type CharacterTalkStreamHandlers = {
  onMeta?: (meta: CharacterTalkMeta) => void;
  onDelta?: (text: string) => void;
  onDone?: (done: CharacterTalkDone) => void;
};
