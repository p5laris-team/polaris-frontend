/**
 * 별친구 상호작용과 대화 스트림 API입니다.
 * 일반 JSON 상호작용은 axios 공통 클라이언트를 쓰고, SSE 응답은 fetch stream으로 직접 읽습니다.
 */
import { useMutation } from "@tanstack/react-query";

import {
  type CharacterInteractionRequest,
  type CharacterInteractionResponse,
  type CharacterTalkDone,
  type CharacterTalkMeta,
  type CharacterTalkStreamHandlers,
  type CharacterTalkStreamRequest,
} from "@/features/character/model/characterTalkTypes";
import { apiClient, unwrapApiResponse } from "@/shared/api";
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

/** 캐릭터 터치/상태 트리거에 맞는 대사와 기억 조각을 받아옵니다. */
export function interactWithCharacter(characterId: number, body: CharacterInteractionRequest = {}) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoInteractWithCharacter(characterId));
  }

  return unwrapApiResponse<CharacterInteractionResponse>(
    apiClient.post(`/api/character/v1/characters/${characterId}/interactions`, body),
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
    headers: buildStreamHeaders(),
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

function buildApiUrl(path: string) {
  const baseUrl = runtimeConfig.apiBaseUrl.replace(/\/$/, "");
  return `${baseUrl}${path}`;
}

function buildStreamHeaders() {
  const headers: Record<string, string> = {
    Accept: "text/event-stream",
    "Content-Type": "application/json",
  };
  const accessToken = useAuthStore.getState().accessToken;

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
