/**
 * 별친구와 SSE 멀티턴 대화를 나누는 전용 화면입니다.
 */
import { type KeyboardEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { BookOpenText, MessageCircle } from "lucide-react";
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
  Card,
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
  const diaryRange = useMemo(() => {
    const today = new Date();

    return {
      fromDate: formatLocalDateKey(addDays(today, -29)),
      toDate: formatLocalDateKey(today),
    };
  }, []);
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
            onRetry={() => {
              void diariesQuery.refetch();
            }}
            onSelectDate={setSelectedDiaryDate}
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
  onRetry,
  onSelectDate,
  selectedDay,
  selectedDate,
}: {
  characterName: string;
  days: CharacterTalkDiaryDay[];
  isError: boolean;
  isLoading: boolean;
  onRetry: () => void;
  onSelectDate: (date: string) => void;
  selectedDay: CharacterTalkDiaryDay | null;
  selectedDate: string;
}) {
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const expanded = Boolean(selectedDay?.date && expandedDate === selectedDay.date);

  useEffect(() => {
    setExpandedDate(null);
  }, [selectedDate]);

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
        <Card className="character-talk-page__diary-empty">
          <img src={emptyStateAssets.memory} alt="" />
          <strong>아직 남겨진 기억 일기가 없어요.</strong>
          <p>{characterName}와 하루를 더 나누면, 작은 마음 조각들이 여기에 차곡차곡 남아요.</p>
        </Card>
      </section>
    );
  }

  return (
    <section className="character-talk-page__diary" aria-label="기억 일기">
      <div className="character-talk-page__diary-date-strip" aria-label="기억 일기 날짜 선택">
        <span className="character-talk-page__diary-date-strip-label">최근 30일</span>
        {days.map((day) => (
          <button
            className={day.date === selectedDate ? "is-active" : ""}
            key={day.date}
            onClick={() => onSelectDate(day.date)}
            type="button"
          >
            <strong>{formatDiaryDayNumber(day.date)}</strong>
            <span>{formatDiaryWeekday(day.date)}</span>
            {day.items.length ? <small>{day.items.length}</small> : null}
          </button>
        ))}
      </div>

      {selectedDay?.items.length ? (
        <article className="character-talk-page__diary-card" key={selectedDay.date}>
          <img className="character-talk-page__diary-bg" src={memoryAssets.cardBg} alt="" />
          <img className="character-talk-page__diary-glow" src={memoryAssets.unlockedGlow} alt="" />
          <button
            aria-expanded={expanded}
            className="character-talk-page__diary-card-main"
            onClick={() => setExpandedDate(expanded ? null : selectedDay.date)}
            onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
              if (event.key === "Escape") setExpandedDate(null);
            }}
            type="button"
          >
            <div className="character-talk-page__diary-icon">
              <img src={memoryAssets.fragmentLore} alt="" />
            </div>
            <div className="character-talk-page__diary-copy">
              <span>{formatDiaryDate(selectedDay.date)}</span>
              <strong>{formatDiaryTitle(selectedDay.date)}</strong>
              <p>{formatDiaryPreview(selectedDay.summary, characterName)}</p>
              <small>
                {expanded
                  ? "접기"
                  : selectedDay.items.length > 1
                    ? `${selectedDay.items.length}개의 대화 조각 자세히 보기`
                    : "대화 조각 자세히 보기"}
              </small>
            </div>
          </button>

          {expanded ? (
            <div className="character-talk-page__diary-detail">
              <div className="character-talk-page__diary-detail-head">
                <strong>그날의 대화 조각</strong>
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
        <Card className="character-talk-page__diary-empty character-talk-page__diary-empty--selected">
          <img src={emptyStateAssets.memory} alt="" />
          <strong>{formatDiaryDate(selectedDay?.date ?? selectedDate)}에는 아직 일기가 없어요.</strong>
          <p>그날 {characterName}와 조금 더 이야기하면, 하루의 마음 조각이 여기에 남아요.</p>
        </Card>
      )}
    </section>
  );
}

function mapHistoryMessagesToDisplay(messages: CharacterTalkHistoryMessage[]): CharacterTalkDisplayMessage[] {
  return [...messages]
    .sort((left, right) => left.sequence - right.sequence)
    .map((message) => ({
      id: `${message.sessionId}-${message.sequence}-${message.role}`,
      role: message.role === "user" ? "user" : "character",
      text: message.content,
      fallbackUsed: message.fallbackUsed,
    }));
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

function groupDiaryItemsByDate(items: CharacterTalkDiaryItem[], fromDate: string, toDate: string): CharacterTalkDiaryDay[] {
  const grouped = new Map<string, CharacterTalkDiaryItem[]>();
  items.forEach((item) => {
    grouped.set(item.date, [...(grouped.get(item.date) ?? []), item]);
  });

  return enumerateDatesDesc(fromDate, toDate).map((date) => {
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

function enumerateDatesDesc(fromDate: string, toDate: string) {
  const dates: string[] = [];
  const cursor = new Date(`${toDate}T00:00:00+09:00`);
  const end = new Date(`${fromDate}T00:00:00+09:00`);

  while (cursor >= end) {
    dates.push(formatLocalDateKey(cursor));
    cursor.setDate(cursor.getDate() - 1);
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
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${value}T00:00:00+09:00`));
}

function formatDiaryDayNumber(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    day: "numeric",
  }).format(new Date(`${value}T00:00:00+09:00`));
}

function formatDiaryWeekday(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    weekday: "short",
  }).format(new Date(`${value}T00:00:00+09:00`));
}

function formatDiaryTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDiaryTitle(value: string) {
  const today = formatLocalDateKey(new Date());
  if (value === today) return "오늘의 마음 조각";
  return "그날의 마음 조각";
}

function formatDiaryPreview(summary: string, characterName: string) {
  return toDiaryLines(summary, characterName)
    .slice(0, 6)
    .join("\n");
}

function formatDiaryDetail(summary: string, characterName: string) {
  return toDiaryLines(summary, characterName).join("\n");
}

function toDiaryLines(summary: string, characterName: string) {
  return normalizeDiarySummary(summary)
    .replace(/\s*사용자:\s*/g, "\n나: ")
    .replace(/\s*별친구:\s*/g, `\n${characterName}: `)
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function normalizeDiarySummary(summary: string) {
  return summary.replace(/^이전 대화 요약:\s*/, "").trim();
}
