/**
 * 별친구 상호작용과 대화 스트림 API입니다.
 * 일반 JSON 상호작용은 axios 공통 클라이언트를 쓰고, SSE 응답은 fetch stream으로 직접 읽습니다.
 */
import { useMutation, useQuery } from "@tanstack/react-query";

import {
  type CharacterInteractionRequest,
  type CharacterInteractionResponse,
  type CharacterTalkDiariesResponse,
  type CharacterTalkDone,
  type CharacterTalkMessagesResponse,
  type CharacterTalkMeta,
  type CharacterTalkStreamHandlers,
  type CharacterTalkStreamRequest,
} from "@/features/character/model/characterTalkTypes";
import { apiClient, getOrRefreshAccessToken, unwrapApiResponse } from "@/shared/api";
import { runtimeConfig } from "@/shared/config/env";
import { useAuthStore } from "@/stores/authStore";

type StreamCharacterTalkOptions = {
  characterId: number;
  body: CharacterTalkStreamRequest;
  signal?: AbortSignal;
} & CharacterTalkStreamHandlers;

type SseFrame = {
  event: string;
  data: string;
};

export const characterTalkQueryKeys = {
  all: ["character-talk"] as const,
  messages: (characterId: number, date?: string) =>
    [...characterTalkQueryKeys.all, "messages", characterId, date ?? "today"] as const,
  diaries: (characterId: number, fromDate?: string, toDate?: string) =>
    [...characterTalkQueryKeys.all, "diaries", characterId, fromDate ?? "default", toDate ?? "default"] as const,
};

/** 캐릭터 터치/상태 트리거에 맞는 대사와 기억 조각을 받아옵니다. */
export function interactWithCharacter(characterId: number, body: CharacterInteractionRequest = {}) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoInteractWithCharacter(characterId));
  }

  return unwrapApiResponse<CharacterInteractionResponse>(
    apiClient.post(`/api/character/v1/characters/${characterId}/interactions`, body),
  );
}

/** 특정 날짜에 나눈 별친구 대화 원문을 조회합니다. */
export function getCharacterTalkMessages(characterId: number, date?: string) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoGetCharacterTalkMessages(characterId, date));
  }

  return unwrapApiResponse<CharacterTalkMessagesResponse>(
    apiClient.get(`/api/character/v1/characters/${characterId}/talk/messages`, {
      params: date ? { date } : undefined,
    }),
  );
}

/** 날짜 구간별 별친구 기억 일기 요약을 조회합니다. */
export function getCharacterTalkDiaries(characterId: number, fromDate?: string, toDate?: string) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoGetCharacterTalkDiaries(characterId, fromDate, toDate));
  }

  return unwrapApiResponse<CharacterTalkDiariesResponse>(
    apiClient.get(`/api/character/v1/characters/${characterId}/talk/diaries`, {
      params: {
        ...(fromDate ? { from: fromDate } : {}),
        ...(toDate ? { to: toDate } : {}),
      },
    }),
  );
}

/** fetch stream으로 백엔드 SSE 이벤트를 읽어 화면 콜백에 전달합니다. */
export async function streamCharacterTalk({
  characterId,
  body,
  signal,
  onMeta,
  onDelta,
  onDone,
}: StreamCharacterTalkOptions) {
  if (runtimeConfig.useApiFixtures) {
    await demoStreamCharacterTalk(body, { onMeta, onDelta, onDone });
    return;
  }

  const response = await fetch(buildApiUrl(`/api/character/v1/characters/${characterId}/talk/stream`), {
    method: "POST",
    headers: await buildStreamHeaders(),
    body: JSON.stringify({
      message: body.message,
      interactionType: body.interactionType ?? "TAP",
      sessionId: body.sessionId ?? "",
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(await getStreamErrorMessage(response));
  }

  if (!response.body) {
    throw new Error("별친구 대화 연결을 열지 못했어요. 다시 시도해 주세요.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    buffer = consumeSseBuffer(buffer, { onMeta, onDelta, onDone });
  }

  buffer += decoder.decode();
  consumeSseBuffer(`${buffer}\n\n`, { onMeta, onDelta, onDone });
}

/** 캐릭터 상호작용 mutation hook입니다. */
export function useCharacterInteractionMutation() {
  return useMutation({
    mutationFn: ({ characterId, body }: { characterId: number; body?: CharacterInteractionRequest }) =>
      interactWithCharacter(characterId, body),
  });
}

/** 오늘 또는 선택 날짜의 대화 원문을 화면 복원용으로 조회합니다. */
export function useCharacterTalkMessagesQuery(characterId: number | null, date?: string) {
  return useQuery({
    queryKey: characterTalkQueryKeys.messages(characterId ?? 0, date),
    queryFn: () => getCharacterTalkMessages(characterId ?? 0, date),
    enabled: Boolean(characterId),
    staleTime: 30_000,
  });
}

/** 기억 일기 목록을 조회합니다. */
export function useCharacterTalkDiariesQuery(
  characterId: number | null,
  fromDate?: string,
  toDate?: string,
) {
  return useQuery({
    queryKey: characterTalkQueryKeys.diaries(characterId ?? 0, fromDate, toDate),
    queryFn: () => getCharacterTalkDiaries(characterId ?? 0, fromDate, toDate),
    enabled: Boolean(characterId),
    staleTime: 60_000,
  });
}

function buildApiUrl(path: string) {
  const baseUrl = runtimeConfig.apiBaseUrl.replace(/\/$/, "");
  return `${baseUrl}${path}`;
}

async function buildStreamHeaders() {
  const headers: Record<string, string> = {
    Accept: "text/event-stream",
    "Content-Type": "application/json",
  };
  const accessToken = await getOrRefreshAccessToken();

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
}

async function getStreamErrorMessage(response: Response) {
  try {
    const body = await response.json();
    return body?.error?.message ?? "별친구 대화 연결이 잠시 흔들렸어요. 다시 시도해 주세요.";
  } catch {
    return "별친구 대화 연결이 잠시 흔들렸어요. 다시 시도해 주세요.";
  }
}

function consumeSseBuffer(buffer: string, handlers: CharacterTalkStreamHandlers) {
  const frames = buffer.split(/\r?\n\r?\n/);
  const rest = frames.pop() ?? "";

  frames
    .map(parseSseFrame)
    .filter((frame): frame is SseFrame => Boolean(frame))
    .forEach((frame) => dispatchSseFrame(frame, handlers));

  return rest;
}

function parseSseFrame(rawFrame: string): SseFrame | null {
  const lines = rawFrame.split(/\r?\n/);
  let event = "message";
  const data: string[] = [];

  lines.forEach((line) => {
    if (!line || line.startsWith(":")) return;

    const separatorIndex = line.indexOf(":");
    const field = separatorIndex >= 0 ? line.slice(0, separatorIndex) : line;
    const value = separatorIndex >= 0 ? line.slice(separatorIndex + 1).replace(/^ /, "") : "";

    if (field === "event") {
      event = value;
    }

    if (field === "data") {
      data.push(value);
    }
  });

  if (!data.length) return null;

  return {
    event,
    data: data.join("\n"),
  };
}

function dispatchSseFrame(frame: SseFrame, handlers: CharacterTalkStreamHandlers) {
  if (frame.event === "delta") {
    const payload = safeJsonParse<{ text?: string }>(frame.data);
    const text = payload?.text ?? "";
    if (text) handlers.onDelta?.(text);
    return;
  }

  if (frame.event === "meta") {
    const payload = safeJsonParse<CharacterTalkMeta>(frame.data);
    if (payload) handlers.onMeta?.(payload);
    return;
  }

  if (frame.event === "done") {
    const payload = safeJsonParse<CharacterTalkDone>(frame.data);
    if (payload) handlers.onDone?.(payload);
  }
}

function safeJsonParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function demoInteractWithCharacter(characterId: number): CharacterInteractionResponse {
  return {
    characterId,
    characterTypeCode: "NOVA",
    level: 1,
    fragmentType: "COMMON",
    triggerType: "TAP",
    message: "작은 빛도 천천히 남겨둘게.",
    interpretation: "별친구가 오늘의 작은 시도도 잘 보고 있는 것 같아요.",
    memoryUnlocked: false,
    alreadyUnlocked: false,
    memory: null,
  };
}

function demoGetCharacterTalkMessages(characterId: number, date?: string): CharacterTalkMessagesResponse {
  const today = date ?? formatLocalDateKey(new Date());

  return {
    characterId,
    date: today,
    latestSessionId: "demo-session-today",
    messages: [
      {
        role: "user",
        content: "오늘 회사 다녀왔는데 조금 지쳤어.",
        sequence: 1,
        requestId: "demo-talk-1",
        fallbackUsed: false,
        createdAt: `${today}T20:04:00+09:00`,
        sessionId: "demo-session-today",
      },
      {
        role: "assistant",
        content: "무... 무무. (해석: 무무가 오늘은 정말 고생했고, 지금은 잠깐 기대도 괜찮다고 하는 것 같아요.)",
        sequence: 2,
        requestId: "demo-talk-1",
        fallbackUsed: false,
        createdAt: `${today}T20:04:03+09:00`,
        sessionId: "demo-session-today",
      },
    ],
  };
}

function demoGetCharacterTalkDiaries(
  characterId: number,
  fromDate?: string,
  toDate?: string,
): CharacterTalkDiariesResponse {
  const today = formatLocalDateKey(new Date());
  const from = fromDate ?? formatLocalDateKey(addDays(new Date(), -6));

  return {
    characterId,
    fromDate: from,
    toDate: toDate ?? today,
    items: [
      {
        date: today,
        summary: "회사에서 지쳤던 마음을 말했고, 별친구는 잠깐 기대어 쉬어도 괜찮다고 다정하게 받아줬어요.",
        sourceSessionId: 1,
        createdAt: `${today}T23:59:00+09:00`,
      },
      {
        date: formatLocalDateKey(addDays(new Date(), -1)),
        summary: "작은 루틴을 해낸 뒤 스스로를 조금 더 믿어보기로 했어요.",
        sourceSessionId: 2,
        createdAt: `${formatLocalDateKey(addDays(new Date(), -1))}T23:59:00+09:00`,
      },
    ],
  };
}

async function demoStreamCharacterTalk(
  body: CharacterTalkStreamRequest,
  handlers: CharacterTalkStreamHandlers,
) {
  const sessionId = body.sessionId || `demo-talk-${Date.now()}`;
  handlers.onMeta?.({
    requestId: `demo-${Date.now()}`,
    characterId: 0,
    characterTypeCode: "NOVA",
    level: 1,
    sessionId,
    newSession: !body.sessionId,
    historyWindowTurns: 1,
    memoryHitCount: 0,
    talkStatus: "AVAILABLE",
    dailyLimit: 20,
    remainingCount: 19,
    limitExceeded: false,
    sentAt: new Date().toISOString(),
  });

  for (const chunk of ["응, 들었어. ", "오늘은 아주 작은 것부터 같이 정리해 보자."]) {
    await new Promise((resolve) => window.setTimeout(resolve, 180));
    handlers.onDelta?.(chunk);
  }

  handlers.onDone?.({
    requestId: `demo-${Date.now()}`,
    sessionId,
    fallbackUsed: false,
    talkStatus: "AVAILABLE",
    dailyLimit: 20,
    remainingCount: 19,
    limitExceeded: false,
  });
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function formatLocalDateKey(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}
