/**
 * 별친구와 SSE 멀티턴 대화를 나누는 전용 화면입니다.
 */
import { type KeyboardEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { BookOpenText, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { toCharacterKey, type CharacterStates } from "@/entities/character/types";
import {
  useActiveCharacterQuery,
  useCharacterStatusQuery,
} from "@/features/character/api/characterCareApi";
import {
  characterTalkQueryKeys,
  useCharacterTalkDiariesQuery,
  useCharacterTalkMessagesQuery,
} from "@/features/character/api/characterTalkApi";
import {
  type CharacterTalkDiaryItem,
  type CharacterTalkDisplayMessage,
  type CharacterTalkHistoryMessage,
} from "@/features/character/model/characterTalkTypes";
import {
  resolveCharacterGrowthAssetLevel,
  resolveCharacterImageUrl,
} from "@/features/character/model/characterAssetResolver";
import { CharacterTalkCard } from "@/features/character/ui/CharacterTalkCard";
import { AppBottomNavigation } from "@/features/navigation/AppBottomNavigation";
import { routes } from "@/routes/paths";
import { getUserFacingErrorMessage } from "@/shared/api";
import {
  AppShell,
  ErrorState,
  Header,
} from "@/shared/ui";
import {
  emptyStateAssets,
  memoryAssets,
  talkAssets,
  type CharacterMood,
} from "@/shared/assets/polarisAssets";

import "./CharacterTalkPage.css";

type TalkPanel = "conversation" | "diary";

type CharacterTalkDiaryDay = {
  date: string;
  items: CharacterTalkDiaryItem[];
  latestCreatedAt: string | null;
  summary: string;
};

export function CharacterTalkPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activePanel, setActivePanel] = useState<TalkPanel>("conversation");
  const activeCharacterQuery = useActiveCharacterQuery();
  const characterId = activeCharacterQuery.data?.id ?? null;
  const statusQuery = useCharacterStatusQuery(characterId);
  const todayKey = useMemo(() => formatLocalDateKey(new Date()), []);
  const [diaryWindowEndDate, setDiaryWindowEndDate] = useState(todayKey);
  const diaryRange = useMemo(() => {
    const endDate = parseLocalDate(diaryWindowEndDate);

    return {
      fromDate: formatLocalDateKey(addDays(endDate, -29)),
      toDate: diaryWindowEndDate,
    };
  }, [diaryWindowEndDate]);
  const [selectedDiaryDate, setSelectedDiaryDate] = useState(todayKey);
  const messagesQuery = useCharacterTalkMessagesQuery(characterId, todayKey);
  const diariesQuery = useCharacterTalkDiariesQuery(characterId, diaryRange.fromDate, diaryRange.toDate);

  const character = activeCharacterQuery.data;
  const states = statusQuery.data?.states ?? character?.states;
  const growth = statusQuery.data?.growth ?? character?.growth ?? null;
  const characterKey = character ? toCharacterKey(character.characterTypeCode) : "nova";
  const mood = toTalkMood(states);
  const characterImageUrl = useMemo(() => {
    if (!character) return undefined;

    return resolveCharacterImageUrl({
      character: characterKey,
      mood,
      states,
      growth,
      equippedSkin: character.equippedSkin ?? null,
      assetUrls: character.assetUrls,
      fallbackUrl: character.currentAssetUrl,
    });
  }, [character, characterKey, growth, mood, states]);
  const restoredMessages = useMemo(
    () => mapHistoryMessagesToDisplay(messagesQuery.data?.messages ?? []),
    [messagesQuery.data?.messages],
  );
  const latestSessionId = messagesQuery.data?.latestSessionId || null;
  const diaryDays = useMemo(
    () => groupDiaryItemsByDate(diariesQuery.data?.items ?? [], diaryRange.fromDate, diaryRange.toDate),
    [diariesQuery.data?.items, diaryRange.fromDate, diaryRange.toDate],
  );
  const selectedDiaryDay = diaryDays.find((day) => day.date === selectedDiaryDate) ?? diaryDays[0] ?? null;

  if (activeCharacterQuery.isLoading || statusQuery.isLoading) {
    return <CharacterTalkLoadingPage />;
  }

  if (activeCharacterQuery.isError || statusQuery.isError || !character) {
    const error = activeCharacterQuery.error ?? statusQuery.error;

    return (
      <CharacterTalkFrame>
        <ErrorState
          className="character-talk-page__state"
          description={getUserFacingErrorMessage(error)}
          imageSrc={emptyStateAssets.talk}
          onAction={() => {
            void activeCharacterQuery.refetch();
            void statusQuery.refetch();
          }}
          title="대화를 열지 못했어요."
        />
      </CharacterTalkFrame>
    );
  }

  const growthLevel = resolveCharacterGrowthAssetLevel(growth);

  return (
    <CharacterTalkFrame>
      <div className="character-talk-page__body">
        <section className="character-talk-page__hero" aria-label={`${character.name} 대화 연결`}>
          <img className="character-talk-page__hero-bg" src={talkAssets.panelBg} alt="" />
          <div className="character-talk-page__hero-copy">
            <span>Talk</span>
            <h2>{character.name}</h2>
            <p>오늘의 별빛 수신 중</p>
          </div>
          <img
            className={[
              "character-talk-page__character",
              growthLevel ? `character-talk-page__character--${growthLevel}` : "",
            ]
              .filter(Boolean)
              .join(" ")}
            src={characterImageUrl}
            alt=""
          />
        </section>

        <div className="character-talk-page__tabs" aria-label="별친구 대화 보기 방식">
          <button
            className={activePanel === "conversation" ? "is-active" : ""}
            onClick={() => setActivePanel("conversation")}
            type="button"
          >
            <MessageCircle size={16} strokeWidth={2.2} />
            <span>오늘 대화</span>
          </button>
          <button
            className={activePanel === "diary" ? "is-active" : ""}
            onClick={() => setActivePanel("diary")}
            type="button"
          >
            <BookOpenText size={16} strokeWidth={2.2} />
            <span>기억 일기</span>
          </button>
        </div>

        {activePanel === "conversation" ? (
          <>
            {messagesQuery.isError ? (
              <div className="character-talk-page__inline-error">
                오늘 대화 기록을 불러오지 못했어요. 새로 나누는 대화는 계속 사용할 수 있어요.
              </div>
            ) : null}
            <CharacterTalkCard
              characterId={character.id}
              characterKey={characterKey}
              characterName={character.name}
              className="character-talk-page__conversation"
              historyLoading={messagesQuery.isLoading}
              initialMessages={restoredMessages}
              initialSessionId={latestSessionId}
              onConversationUpdated={() => {
                void queryClient.invalidateQueries({
                  queryKey: characterTalkQueryKeys.messages(character.id, todayKey),
                });
              }}
              showInteractionButton={false}
              title="오늘의 대화"
            />
          </>
        ) : (
          <CharacterTalkDiarySection
            characterName={character.name}
            days={diaryDays}
            isError={diariesQuery.isError}
            isLoading={diariesQuery.isLoading}
            canMoveToNewerRange={diaryWindowEndDate < todayKey}
            onRetry={() => {
              void diariesQuery.refetch();
            }}
            onMoveRange={(direction) => {
              const currentEndDate = parseLocalDate(diaryWindowEndDate);
              const nextEndDate = formatLocalDateKey(addDays(currentEndDate, direction * 30));
              const boundedEndDate = nextEndDate > todayKey ? todayKey : nextEndDate;

              setDiaryWindowEndDate(boundedEndDate);
              setSelectedDiaryDate(boundedEndDate);
            }}
            onSelectDate={setSelectedDiaryDate}
            rangeLabel={formatDiaryRangeLabel(
              diaryRange.fromDate,
              diaryRange.toDate,
              diaryWindowEndDate === todayKey,
            )}
            selectedDay={selectedDiaryDay}
            selectedDate={selectedDiaryDate}
          />
        )}
      </div>
    </CharacterTalkFrame>
  );
}

function CharacterTalkFrame({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  return (
    <main className="character-talk-page">
      <AppShell>
        <Header title="대화하기" onBack={() => navigate(routes.home)} />
        {children}
        <AppBottomNavigation />
      </AppShell>
    </main>
  );
}

function CharacterTalkLoadingPage() {
  return (
    <CharacterTalkFrame>
      <div className="character-talk-page__body">
        <div className="character-talk-page__skeleton character-talk-page__skeleton--hero" />
        <div className="character-talk-page__skeleton character-talk-page__skeleton--conversation" />
      </div>
    </CharacterTalkFrame>
  );
}

function toTalkMood(states?: CharacterStates): CharacterMood {
  if (!states) return "idle";
  if (states.energy?.grade === "BAD") return "sleepy";
  if (states.affection?.grade === "GOOD") return "happy";
  return "idle";
}

function CharacterTalkDiarySection({
  characterName,
  days,
  isError,
  isLoading,
  canMoveToNewerRange,
  onMoveRange,
  onRetry,
  onSelectDate,
  rangeLabel,
  selectedDay,
  selectedDate,
}: {
  characterName: string;
  days: CharacterTalkDiaryDay[];
  isError: boolean;
  isLoading: boolean;
  canMoveToNewerRange: boolean;
  onMoveRange: (direction: -1 | 1) => void;
  onRetry: () => void;
  onSelectDate: (date: string) => void;
  rangeLabel: string;
  selectedDay: CharacterTalkDiaryDay | null;
  selectedDate: string;
}) {
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const dateStripRef = useRef<HTMLDivElement | null>(null);
  const expanded = Boolean(selectedDay?.date && expandedDate === selectedDay.date);

  useEffect(() => {
    setExpandedDate(null);
  }, [selectedDate]);

  useEffect(() => {
    const selectedButton = dateStripRef.current?.querySelector<HTMLButtonElement>(
      `[data-diary-date="${selectedDate}"]`,
    );
    const dateStrip = dateStripRef.current;

    if (!dateStrip || !selectedButton) return;

    const nextLeft = selectedButton.offsetLeft - dateStrip.clientWidth / 2 + selectedButton.clientWidth / 2;
    dateStrip.scrollTo({
      left: Math.max(0, nextLeft),
      behavior: "smooth",
    });
  }, [days, selectedDate]);

  const scrollDateStrip = (direction: -1 | 1) => {
    dateStripRef.current?.scrollBy({
      left: direction * 220,
      behavior: "smooth",
    });
  };

  if (isLoading) {
    return (
      <section className="character-talk-page__diary character-talk-page__diary--loading" aria-label="기억 일기">
        <div className="character-talk-page__diary-skeleton" />
        <div className="character-talk-page__diary-skeleton" />
        <div className="character-talk-page__diary-skeleton" />
      </section>
    );
  }

  if (isError) {
    return (
      <section className="character-talk-page__diary" aria-label="기억 일기">
        <ErrorState
          className="character-talk-page__diary-state"
          description="잠시 뒤에 다시 불러오면 별친구가 남긴 기록을 이어서 볼 수 있어요."
          imageSrc={emptyStateAssets.errorNetwork}
          onAction={onRetry}
          title="기억 일기를 불러오지 못했어요."
        />
      </section>
    );
  }

  if (!days.length) {
    return (
      <section className="character-talk-page__diary" aria-label="기억 일기">
        <div className="character-talk-page__diary-empty">
          <img src={emptyStateAssets.memory} alt="" />
          <strong>아직 남겨진 기억 일기가 없어요.</strong>
          <p>{characterName}와 하루를 더 나누면, 작은 마음 조각들이 여기에 차곡차곡 남아요.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="character-talk-page__diary" aria-label="기억 일기">
      <div className="character-talk-page__diary-date-controls">
        <div className="character-talk-page__diary-range">
          <button
            aria-label="이전 30일 보기"
            className="character-talk-page__diary-range-button"
            onClick={() => onMoveRange(-1)}
            type="button"
          >
            <ChevronLeft size={14} strokeWidth={2.4} />
            <span>이전</span>
          </button>
          <strong>{rangeLabel}</strong>
          <button
            aria-label="다음 30일 보기"
            className="character-talk-page__diary-range-button"
            disabled={!canMoveToNewerRange}
            onClick={() => onMoveRange(1)}
            type="button"
          >
            <span>다음</span>
            <ChevronRight size={14} strokeWidth={2.4} />
          </button>
        </div>

        <div className="character-talk-page__diary-date-row">
          <button
            aria-label="이전 날짜 보기"
            className="character-talk-page__diary-date-nav"
            onClick={() => scrollDateStrip(-1)}
            type="button"
          >
            <ChevronLeft size={16} strokeWidth={2.4} />
          </button>
          <div className="character-talk-page__diary-date-strip" ref={dateStripRef} aria-label="기억 일기 날짜 선택">
            {days.map((day) => (
              <button
                aria-label={`${formatDiaryDate(day.date)} ${
                  day.items.length ? `${day.items.length}개의 기억 일기` : "기억 일기 없음"
                }`}
                className={day.date === selectedDate ? "is-active" : ""}
                data-diary-date={day.date}
                key={day.date}
                onClick={() => onSelectDate(day.date)}
                type="button"
              >
                <strong>{formatDiaryDayNumber(day.date)}</strong>
                <span className="character-talk-page__diary-date-weekday">{formatDiaryWeekday(day.date)}</span>
                {day.items.length ? <span className="character-talk-page__diary-date-dot" aria-hidden="true" /> : null}
              </button>
            ))}
          </div>
          <button
            aria-label="더 최근 날짜 보기"
            className="character-talk-page__diary-date-nav"
            onClick={() => scrollDateStrip(1)}
            type="button"
          >
            <ChevronRight size={16} strokeWidth={2.4} />
          </button>
        </div>
      </div>

      {selectedDay?.items.length ? (
        <article
          className={[
            "character-talk-page__diary-card",
            expanded ? "character-talk-page__diary-card--expanded" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          key={selectedDay.date}
        >
          <img className="character-talk-page__diary-bg" src={memoryAssets.cardBg} alt="" />
          <img className="character-talk-page__diary-glow" src={memoryAssets.unlockedGlow} alt="" />
          <div className="character-talk-page__diary-paper">
            <div className="character-talk-page__diary-icon">
              <img src={memoryAssets.fragmentLore} alt="" />
            </div>
            <div className="character-talk-page__diary-copy">
              <span>{formatDiaryDate(selectedDay.date)}</span>
              <strong>{formatDiaryTitle(selectedDay.date)}</strong>
              <p>{formatDiaryCardSummary(selectedDay.summary, characterName, selectedDay.items.length)}</p>
            </div>
          </div>

          {selectedDay.items.length > 1 ? (
            <button
              aria-expanded={expanded}
              className="character-talk-page__diary-toggle"
              onClick={() => setExpandedDate(expanded ? null : selectedDay.date)}
              onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
                if (event.key === "Escape") setExpandedDate(null);
              }}
              type="button"
            >
              <span>{expanded ? "일기 조각 접기" : `${selectedDay.items.length}개의 일기 조각 보기`}</span>
            </button>
          ) : null}

          {expanded && selectedDay.items.length > 1 ? (
            <div className="character-talk-page__diary-detail">
              <div className="character-talk-page__diary-detail-head">
                <strong>그날의 일기 조각</strong>
                <span>{selectedDay.items.length}개</span>
              </div>
              {selectedDay.items.map((item) => (
                <div className="character-talk-page__diary-piece" key={`${item.date}-${item.sourceSessionId}`}>
                  <span>{formatDiaryTime(item.createdAt)}</span>
                  <p>{formatDiaryDetail(item.summary, characterName)}</p>
                </div>
              ))}
            </div>
          ) : null}
        </article>
      ) : (
        <div className="character-talk-page__diary-empty character-talk-page__diary-empty--selected">
          <img src={emptyStateAssets.memory} alt="" />
          <strong>{formatDiaryDate(selectedDay?.date ?? selectedDate)}에는 아직 일기가 없어요.</strong>
          <p>그날 {characterName}와 조금 더 이야기하면, 하루의 마음 조각이 여기에 남아요.</p>
        </div>
      )}
    </section>
  );
}

function mapHistoryMessagesToDisplay(messages: CharacterTalkHistoryMessage[]): CharacterTalkDisplayMessage[] {
  return messages
    .map((message, index) => ({ message, index }))
    .sort((left, right) => compareHistoryMessages(left.message, right.message, left.index, right.index))
    .map(({ message }) => ({
      id: `${message.sessionId}-${message.sequence}-${message.role}`,
      role: message.role === "user" ? "user" : "character",
      text: message.content,
      fallbackUsed: message.fallbackUsed,
    }));
}

function compareHistoryMessages(
  left: CharacterTalkHistoryMessage,
  right: CharacterTalkHistoryMessage,
  leftIndex: number,
  rightIndex: number,
) {
  const createdAtOrder = left.createdAt.localeCompare(right.createdAt);
  if (createdAtOrder !== 0) return createdAtOrder;

  if (left.sessionId === right.sessionId) {
    const sequenceOrder = left.sequence - right.sequence;
    if (sequenceOrder !== 0) return sequenceOrder;
  }

  return leftIndex - rightIndex;
}

function formatSeoulDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}`;
}

function formatLocalDateKey(date: Date) {
  return formatSeoulDateKey(date);
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + amount);
  return next;
}

function parseLocalDate(value: string) {
  return new Date(`${value}T00:00:00+09:00`);
}

function parseSeoulDateTime(value: string) {
  if (/[zZ]|[+-]\d{2}:\d{2}$/.test(value)) {
    return new Date(value);
  }
  return new Date(`${value}+09:00`);
}

function groupDiaryItemsByDate(items: CharacterTalkDiaryItem[], fromDate: string, toDate: string): CharacterTalkDiaryDay[] {
  const grouped = new Map<string, CharacterTalkDiaryItem[]>();
  items.forEach((item) => {
    grouped.set(item.date, [...(grouped.get(item.date) ?? []), item]);
  });

  return enumerateDatesAsc(fromDate, toDate).map((date) => {
    const dayItems = [...(grouped.get(date) ?? [])].sort((left, right) =>
      right.createdAt.localeCompare(left.createdAt),
    );

    return {
      date,
      items: dayItems,
      latestCreatedAt: dayItems[0]?.createdAt ?? null,
      summary: mergeDiarySummaries(dayItems),
    };
  });
}

function enumerateDatesAsc(fromDate: string, toDate: string) {
  const dates: string[] = [];
  const cursor = new Date(`${fromDate}T00:00:00+09:00`);
  const end = new Date(`${toDate}T00:00:00+09:00`);

  while (cursor <= end) {
    dates.push(formatLocalDateKey(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
}

function mergeDiarySummaries(items: CharacterTalkDiaryItem[]) {
  return items
    .map((item) => normalizeDiarySummary(item.summary))
    .filter(Boolean)
    .slice(0, 4)
    .join("\n\n");
}

function formatDiaryDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${value}T00:00:00+09:00`));
}

function formatDiaryDayNumber(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00+09:00`));
}

function formatDiaryWeekday(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    weekday: "short",
  }).format(new Date(`${value}T00:00:00+09:00`));
}

function formatDiaryRangeLabel(fromDate: string, toDate: string, isCurrentRange: boolean) {
  if (isCurrentRange) return "최근 30일";
  return `${formatDiaryShortDate(fromDate)} - ${formatDiaryShortDate(toDate)}`;
}

function formatDiaryShortDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "numeric",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00+09:00`));
}

function formatDiaryTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parseSeoulDateTime(value));
}

function formatDiaryTitle(value: string) {
  const today = formatLocalDateKey(new Date());
  if (value === today) return "오늘의 마음 조각";
  return "그날의 마음 조각";
}

function formatDiaryCardSummary(summary: string, characterName: string, itemCount: number) {
  if (itemCount <= 1) {
    return formatDiaryDetail(summary, characterName);
  }
  return formatDiaryPreview(summary, characterName);
}

function formatDiaryPreview(summary: string, characterName: string) {
  return toDiaryParagraphs(summary, characterName)
    .slice(0, 3)
    .join("\n");
}

function formatDiaryDetail(summary: string, characterName: string) {
  return toDiaryParagraphs(summary, characterName).join("\n");
}

function toDiaryParagraphs(summary: string, characterName: string) {
  if (!isLegacyDiarySummary(summary)) {
    return splitDiaryParagraphs(summary);
  }

  const turns = parseDiaryTurns(summary);
  if (!turns.length) {
    return splitDiaryParagraphs(normalizeDiarySummary(summary));
  }

  return turns
    .map((turn) => {
      const text = cleanDiaryText(turn.content);
      if (!text) return "";
      return turn.role === "user" ? `나는 ${text}` : `${characterName}는 ${text}`;
    })
    .filter(Boolean);
}

function isLegacyDiarySummary(summary: string) {
  const value = normalizeDiarySummary(summary);
  return /^\s*이전 대화 요약:\s*/.test(summary) || /(사용자|별친구):\s*/.test(value);
}

function splitDiaryParagraphs(summary: string) {
  return normalizeDiarySummary(summary)
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function parseDiaryTurns(summary: string) {
  const value = normalizeDiarySummary(summary);
  const markers = [...value.matchAll(/(사용자|별친구):\s*/g)];
  if (!markers.length) return [];

  return markers
    .map((marker, index) => {
      const nextMarker = markers[index + 1];
      const start = (marker.index ?? 0) + marker[0].length;
      const end = nextMarker?.index ?? value.length;

      return {
        role: marker[1] === "사용자" ? "user" : "character",
        content: value.slice(start, end).trim(),
      };
    })
    .filter((turn) => turn.content);
}

function cleanDiaryText(value: string) {
  const unquoted = value
    .replace(/^["“”]+|["“”]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const interpretation = unquoted.match(/\(해석:\s*([\s\S]*?)\)\s*$/);

  return (interpretation?.[1] ?? unquoted)
    .replace(/^["“”]+|["“”]+$/g, "")
    .trim();
}

function normalizeDiarySummary(summary: string) {
  return summary.replace(/^이전 대화 요약:\s*/, "").trim();
}
