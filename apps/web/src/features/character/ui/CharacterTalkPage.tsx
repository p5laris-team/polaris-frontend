/**
 * 별친구와 SSE 멀티턴 대화를 나누는 전용 화면입니다.
 */
import { type ReactNode, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { toCharacterKey, type CharacterStates } from "@/entities/character/types";
import {
  useActiveCharacterQuery,
  useCharacterStatusQuery,
} from "@/features/character/api/characterCareApi";
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
  talkAssets,
  type CharacterMood,
} from "@/shared/assets/polarisAssets";

import "./CharacterTalkPage.css";

export function CharacterTalkPage() {
  const navigate = useNavigate();
  const activeCharacterQuery = useActiveCharacterQuery();
  const characterId = activeCharacterQuery.data?.id ?? null;
  const statusQuery = useCharacterStatusQuery(characterId);

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

        <CharacterTalkCard
          characterId={character.id}
          characterKey={characterKey}
          characterName={character.name}
          className="character-talk-page__conversation"
          showInteractionButton={false}
          title="오늘의 대화"
        />
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
