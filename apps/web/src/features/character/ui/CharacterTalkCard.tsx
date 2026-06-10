/**
 * 별친구 대화/터치 반응 카드입니다.
 * 홈과 별친구 상세에서 같은 SSE 스트리밍, 멀티턴 sessionId, 터치 반응 흐름을 재사용합니다.
 */
import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from "react";
import { Hand, SendHorizontal } from "lucide-react";

import {
  streamCharacterTalk,
  useCharacterInteractionMutation,
} from "@/features/character/api/characterTalkApi";
import { formatCharacterInteractionText } from "@/features/character/model/characterToneText";
import {
  type CharacterInteractionResponse,
  type CharacterTalkDisplayMessage,
  type CharacterTalkMeta,
} from "@/features/character/model/characterTalkTypes";
import { getUserFacingErrorMessage } from "@/shared/api";
import {
  emptyStateAssets,
  memoryAssets,
  talkAssets,
  type CharacterKey,
} from "@/shared/assets/polarisAssets";
import { Card, useToast } from "@/shared/ui";

import "./CharacterTalkCard.css";

type RevealState = {
  fullText: string;
  timer: number | null;
  visibleLength: number;
};

type CharacterTalkCardProps = {
  characterId: number;
  characterKey: CharacterKey;
  characterName: string;
  className?: string;
  historyLoading?: boolean;
  initialMessages?: CharacterTalkDisplayMessage[];
  initialSessionId?: string | null;
  onInteractionMessage?: (message: string, result: CharacterInteractionResponse) => void;
  onConversationUpdated?: () => void;
  showInteractionButton?: boolean;
  title?: string;
  variant?: "compact" | "full";
};

const EMPTY_TALK_MESSAGES: CharacterTalkDisplayMessage[] = [];

export function CharacterTalkCard({
  characterId,
  characterKey,
  characterName,
  className,
  historyLoading = false,
  initialMessages = EMPTY_TALK_MESSAGES,
  initialSessionId = null,
  onInteractionMessage,
  onConversationUpdated,
  showInteractionButton = true,
  title = "별친구에게 말 걸기",
  variant = "full",
}: CharacterTalkCardProps) {
  const { showToast } = useToast();
  const interactionMutation = useCharacterInteractionMutation();
  const [interaction, setInteraction] = useState<CharacterInteractionResponse | null>(null);
  const [talkInput, setTalkInput] = useState("");
  const [talkMessages, setTalkMessages] = useState<CharacterTalkDisplayMessage[]>(initialMessages);
  const [talkMeta, setTalkMeta] = useState<CharacterTalkMeta | null>(null);
  const [talkSessionId, setTalkSessionId] = useState<string | null>(initialSessionId);
  const [isTalkStreaming, setIsTalkStreaming] = useState(false);
  const talkAbortRef = useRef<AbortController | null>(null);
  const talkLogRef = useRef<HTMLDivElement | null>(null);
  const revealRef = useRef<Record<string, RevealState>>({});
  const historySyncKeyRef = useRef("");
  const localConversationDirtyRef = useRef(false);
  const lastSubmittedTextRef = useRef<string | null>(null);

  useEffect(() => {
    setInteraction(null);
    setTalkInput("");
    setTalkMessages([]);
    setTalkMeta(null);
    setTalkSessionId(null);
    historySyncKeyRef.current = "";
    localConversationDirtyRef.current = false;
    lastSubmittedTextRef.current = null;
    talkAbortRef.current?.abort();
    clearRevealTimers(revealRef.current);
    revealRef.current = {};
  }, [characterId]);

  useEffect(() => {
    if (isTalkStreaming) {
      return;
    }

    const historySyncKey = buildHistorySyncKey(initialMessages, initialSessionId);

    if (historySyncKeyRef.current === historySyncKey) {
      return;
    }

    if (localConversationDirtyRef.current && !hasSubmittedMessage(initialMessages, lastSubmittedTextRef.current)) {
      return;
    }

    historySyncKeyRef.current = historySyncKey;
    localConversationDirtyRef.current = false;
    lastSubmittedTextRef.current = null;
    setTalkMessages(limitTalkMessages(initialMessages));
    setTalkSessionId(initialSessionId);
  }, [initialMessages, initialSessionId, isTalkStreaming]);

  useEffect(
    () => () => {
      talkAbortRef.current?.abort();
      clearRevealTimers(revealRef.current);
    },
    [],
  );

  useEffect(() => {
    const log = talkLogRef.current;

    if (!log) {
      return;
    }

    log.scrollTop = log.scrollHeight;
  }, [isTalkStreaming, talkMessages]);

  const handleCharacterInteraction = () => {
    if (interactionMutation.isPending) return;

    interactionMutation.mutate(
      {
        characterId,
        body: {
          interactionType: "TAP",
        },
      },
      {
        onSuccess: (result) => {
          const nextMessage = formatCharacterInteractionText(result, characterName);
          setInteraction(result);
          setTalkMessages((messages) =>
            limitTalkMessages([
              ...messages,
              {
                id: `tap-${Date.now()}`,
                role: "character",
                text: nextMessage,
              },
            ]),
          );
          onInteractionMessage?.(nextMessage, result);
          showToast(result.memoryUnlocked && result.memory ? `새 기억 조각: ${result.memory.title}` : nextMessage);
        },
        onError: (error) => {
          showToast(getUserFacingErrorMessage(error));
        },
      },
    );
  };

  const handleTalkSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isTalkStreaming) return;

    const message = talkInput.trim();
    if (!message) return;

    const now = Date.now();
    const userMessage: CharacterTalkDisplayMessage = {
      id: `user-${now}`,
      role: "user",
      text: message,
    };
    const characterMessageId = `character-${now}`;
    let receivedText = "";
    let nextSessionId = talkSessionId;
    let fallbackUsed = false;
    const controller = new AbortController();

    localConversationDirtyRef.current = true;
    lastSubmittedTextRef.current = message;
    setTalkInput("");
    setIsTalkStreaming(true);
    setTalkMessages((messages) =>
      limitTalkMessages([
        ...messages,
        userMessage,
        {
          id: characterMessageId,
          role: "character",
          text: "",
          pending: true,
        },
      ]),
    );
    talkAbortRef.current = controller;

    try {
      await streamCharacterTalk({
        characterId,
        body: {
          message,
          interactionType: "TAP",
          sessionId: talkSessionId,
        },
        signal: controller.signal,
        onMeta: (meta) => {
          setTalkMeta(meta);
          if (meta.sessionId) {
            nextSessionId = meta.sessionId;
          }
        },
        onDelta: (text) => {
          receivedText += text;
          queueTalkReveal(characterMessageId, receivedText);
        },
        onDone: (done) => {
          fallbackUsed = done.fallbackUsed;
          if (done.sessionId) {
            nextSessionId = done.sessionId;
          }
          setTalkMeta((current) =>
            current
              ? {
                  ...current,
                  talkStatus: done.talkStatus,
                  dailyLimit: done.dailyLimit,
                  remainingCount: done.remainingCount,
                  limitExceeded: done.limitExceeded,
                  resetAt: done.resetAt ?? current.resetAt,
                  memoryHitCount: done.memoryHitCount ?? current.memoryHitCount,
                }
              : current,
          );
        },
      });

      if (nextSessionId) {
        setTalkSessionId(nextSessionId);
      }

      await finishTalkReveal(
        characterMessageId,
        receivedText.trim() ? receivedText : "지금은 별빛 연결이 조금 느려요. 잠시 뒤에 다시 말해줘요.",
        fallbackUsed,
      );
      onConversationUpdated?.();
    } catch (error) {
      if (controller.signal.aborted) return;

      const errorMessage = getUserFacingErrorMessage(error);
      setTalkMessages((messages) =>
        updateTalkMessage(messages, characterMessageId, {
          text: errorMessage,
          pending: false,
          fallbackUsed: true,
        }),
      );
      showToast(errorMessage);
    } finally {
      if (talkAbortRef.current === controller) {
        talkAbortRef.current = null;
      }
      setIsTalkStreaming(false);
    }
  };

  const handleTalkKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) {
      return;
    }

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  };

  const queueTalkReveal = (messageId: string, fullText: string) => {
    const state = getRevealState(messageId);
    state.fullText = fullText;
    startRevealTimer(messageId, state);
  };

  const finishTalkReveal = (messageId: string, fullText: string, doneFallbackUsed: boolean) => {
    const state = revealRef.current[messageId];

    if (state?.timer) {
      window.clearInterval(state.timer);
    }

    delete revealRef.current[messageId];
    setTalkMessages((messages) =>
      updateTalkMessage(messages, messageId, {
        fallbackUsed: doneFallbackUsed,
        pending: false,
        text: fullText,
      }),
    );

    return Promise.resolve();
  };

  const getRevealState = (messageId: string) => {
    const current = revealRef.current[messageId];

    if (current) {
      return current;
    }

    const next: RevealState = {
      fullText: "",
      timer: null,
      visibleLength: 0,
    };
    revealRef.current[messageId] = next;
    return next;
  };

  const startRevealTimer = (messageId: string, state: RevealState) => {
    if (state.timer) {
      return;
    }

    state.timer = window.setInterval(() => {
      const current = revealRef.current[messageId];
      if (!current) {
        return;
      }

      if (current.visibleLength < current.fullText.length) {
        const gap = current.fullText.length - current.visibleLength;
        current.visibleLength = Math.min(current.fullText.length, current.visibleLength + (gap > 9 ? 2 : 1));
        setTalkMessages((messages) =>
          updateTalkMessage(messages, messageId, {
            text: current.fullText.slice(0, current.visibleLength),
            pending: true,
          }),
        );
        return;
      }

    }, 24);
  };

  const talkLimitLabel = formatTalkLimit(talkMeta);
  const latestMemory = interaction?.memory ?? null;
  const sectionClassName = [
    "character-talk-card-section",
    `character-talk-card-section--${variant}`,
    showInteractionButton ? "" : "character-talk-card-section--chat-only",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={sectionClassName} aria-label="별친구 대화">
      <div className="character-talk-card-section__title">
        <h2>{title}</h2>
        <span>{talkLimitLabel}</span>
      </div>

      <Card className="character-talk-card">
        <img className="character-talk-card__bg" src={talkAssets.panelBg} alt="" />
        <div className="character-talk-card__head">
          <span className="character-talk-card__avatar">
            <img src={getTalkAvatarAsset(characterKey)} alt="" />
          </span>
          <span className="character-talk-card__copy">
            <strong>{characterName}</strong>
            <p>{interaction ? formatCharacterInteractionText(interaction, characterName) : "오늘의 작은 이야기를 조용히 기다리고 있어요."}</p>
          </span>
          {showInteractionButton ? (
            <button
              aria-label="별친구 터치 반응 보기"
              className="character-talk-card__tap"
              disabled={interactionMutation.isPending}
              onClick={handleCharacterInteraction}
              type="button"
            >
              <Hand size={16} strokeWidth={2} />
              <span>{interactionMutation.isPending ? "듣는 중" : "터치"}</span>
            </button>
          ) : null}
        </div>

        {latestMemory ? (
          <div className="character-talk-card__memory-unlock" aria-live="polite">
            <img className="character-talk-card__memory-bg" src={memoryAssets.cardBg} alt="" />
            <img className="character-talk-card__memory-glow" src={memoryAssets.unlockedGlow} alt="" />
            <img src={getMemoryFragmentAsset(interaction?.fragmentType)} alt="" />
            <span>
              <strong>{latestMemory.title}</strong>
              <small>{latestMemory.storyText}</small>
            </span>
            <img className="character-talk-card__memory-effect" src={memoryAssets.unlockEffect} alt="" />
          </div>
        ) : null}

        <div className="character-talk-card__log" aria-live="polite" ref={talkLogRef}>
          {talkMessages.length ? (
            talkMessages.map((message) => (
              <div
                className={[
                  "character-talk-card__message",
                  `character-talk-card__message--${message.role}`,
                  message.pending ? "character-talk-card__message--pending" : "",
                  message.fallbackUsed ? "character-talk-card__message--fallback" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={message.id}
              >
                {message.role === "character" ? (
                  <img
                    className="character-talk-card__message-avatar"
                    src={getTalkAvatarAsset(characterKey)}
                    alt=""
                  />
                ) : null}
                <span className="character-talk-card__bubble">
                  {message.text ? <p>{message.text}</p> : null}
                  {message.pending ? <img src={talkAssets.typingDots} alt="" /> : null}
                </span>
              </div>
            ))
          ) : (
            <div className="character-talk-card__empty">
              <img src={emptyStateAssets.talk} alt="" />
              <span>
                {historyLoading
                  ? "오늘의 이야기를 불러오는 중이에요."
                  : variant === "compact"
                    ? "톡 누르거나 한마디 남겨보세요."
                    : "아직 나눈 이야기가 없어요."}
              </span>
            </div>
          )}
        </div>

        <form className="character-talk-card__form" onSubmit={handleTalkSubmit}>
          <textarea
            aria-label="별친구에게 보낼 말"
            disabled={isTalkStreaming}
            maxLength={160}
            onKeyDown={handleTalkKeyDown}
            onChange={(event) => setTalkInput(event.target.value)}
            placeholder={`${characterName}에게 오늘 기분을 말해보세요`}
            rows={variant === "compact" ? 1 : 2}
            value={talkInput}
          />
          <button
            aria-label="별친구에게 보내기"
            className="character-talk-card__send"
            disabled={isTalkStreaming || !talkInput.trim()}
            type="submit"
          >
            {isTalkStreaming ? (
              <img src={talkAssets.loadingStar} alt="" />
            ) : (
              <>
                <SendHorizontal size={18} strokeWidth={2.2} />
                <img className="character-talk-card__send-sparkle" src={talkAssets.sendSparkle} alt="" />
              </>
            )}
          </button>
        </form>
      </Card>
    </section>
  );
}

function clearRevealTimers(states: Record<string, RevealState>) {
  Object.values(states).forEach((state) => {
    if (state.timer) {
      window.clearInterval(state.timer);
    }
  });
}

function updateTalkMessage(
  messages: CharacterTalkDisplayMessage[],
  messageId: string,
  patch: Partial<CharacterTalkDisplayMessage>,
) {
  return messages.map((message) => (message.id === messageId ? { ...message, ...patch } : message));
}

function limitTalkMessages(messages: CharacterTalkDisplayMessage[]) {
  // 하루 20턴 대화 원문을 복원할 수 있도록 넉넉히 유지한다.
  return messages.slice(-80);
}

function buildHistorySyncKey(messages: CharacterTalkDisplayMessage[], sessionId: string | null) {
  return [
    sessionId ?? "",
    messages.length,
    messages.map((message) => `${message.id}:${message.role}:${message.text}`).join("|"),
  ].join("::");
}

function hasSubmittedMessage(messages: CharacterTalkDisplayMessage[], submittedText: string | null) {
  if (!submittedText) {
    return false;
  }

  return messages.some((message) => message.role === "user" && message.text.trim() === submittedText);
}

function getTalkAvatarAsset(characterKey: CharacterKey) {
  if (characterKey === "mumu") return talkAssets.avatarMumu;
  if (characterKey === "jjori") return talkAssets.avatarJjori;
  return talkAssets.avatarNova;
}

function getMemoryFragmentAsset(fragmentType?: string) {
  if (fragmentType === "EASTER_EGG") return memoryAssets.fragmentEasterEgg;
  if (fragmentType === "LORE") return memoryAssets.fragmentLore;
  return memoryAssets.fragmentCommon;
}

function formatTalkLimit(meta: CharacterTalkMeta | null) {
  if (!meta) return "오늘 대화 준비됨";
  if (meta.limitExceeded) return "오늘 대화 마감";
  if (meta.remainingCount !== null && meta.dailyLimit > 0) {
    return `오늘 ${meta.remainingCount}/${meta.dailyLimit}회 남음`;
  }
  if (meta.remainingCount !== null) return `오늘 ${meta.remainingCount}회 남음`;
  return "대화 가능";
}
