/**
 * 온보딩 1단계, 별친구 선택 화면입니다.
 * 백엔드의 character-types 목록을 카드로 보여주고,
 * 사용자가 고른 캐릭터 타입을 온보딩 store에 임시 저장합니다.
 */
import { type ReactNode, useEffect } from "react";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { toCharacterKey } from "@/entities/character/types";
import { useCharacterTypesQuery } from "@/features/onboarding/api/characterSetupApi";
import { useOnboardingSetupStore } from "@/features/onboarding/model/onboardingStore";
import { routes } from "@/routes/paths";
import { getUserFacingErrorMessage } from "@/shared/api";
import { characterAssets, emptyStateAssets } from "@/shared/assets/polarisAssets";
import { AppShell, Button, ErrorState, Header, Tag, useToast } from "@/shared/ui";

import "./OnboardingFlow.css";

export function CharacterSelectPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const characterTypesQuery = useCharacterTypesQuery();
  const selectedCharacter = useOnboardingSetupStore((state) => state.selectedCharacter);
  const createdCharacter = useOnboardingSetupStore((state) => state.createdCharacter);
  const selectCharacter = useOnboardingSetupStore((state) => state.selectCharacter);

  useEffect(() => {
    if (createdCharacter) {
      navigate(routes.onboardingQuestions, { replace: true });
    }
  }, [createdCharacter, navigate]);

  /** 캐릭터를 선택했을 때만 이름 짓기 단계로 이동합니다. */
  const handleNext = () => {
    if (!selectedCharacter) {
      showToast("먼저 함께할 별친구를 골라 주세요.");
      return;
    }

    navigate(routes.onboardingCharacterName);
  };

  return (
    <main className="onboarding-page">
      <AppShell>
        <div className="onboarding-flow">
          <Header title="별친구 고르기" onBack={() => navigate(routes.login)} />

          <section className="onboarding-flow__body">
            {/* SCR-003 캐릭터 선택: API 명세의 character-types 목록을 카드형 선택지로 노출한다. */}
            <div className="onboarding-flow__hero">
              <span className="onboarding-flow__eyebrow">STEP 1</span>
              <h1>처음 만날 별친구를 골라 주세요.</h1>
              <p>각 별친구는 같은 시작 흐름을 따르지만, 말투와 응원 방식이 조금씩 달라요.</p>
            </div>

            {characterTypesQuery.isLoading ? (
              <OnboardingState title="별친구를 불러오는 중" description="잠깐만 기다려 주세요." />
            ) : null}

            {characterTypesQuery.isError ? (
              <ErrorState
                className="onboarding-flow__state"
                title="별친구 목록을 못 불러왔어요"
                description={getUserFacingErrorMessage(characterTypesQuery.error)}
                imageSrc={emptyStateAssets.inventory}
                onAction={() => void characterTypesQuery.refetch()}
              />
            ) : null}

            {characterTypesQuery.data ? (
              <>
                <div className="onboarding-flow__stack">
                  {characterTypesQuery.data.items.map((character) => {
                    const characterKey = toCharacterKey(character.code);
                    const selected = selectedCharacter?.id === character.id;

                    return (
                      <button
                        aria-pressed={selected}
                        className={`onboarding-character-option ${
                          selected ? "onboarding-character-option--selected" : ""
                        }`.trim()}
                        key={character.id}
                        onClick={() => selectCharacter(character)}
                        type="button"
                      >
                        <span className="onboarding-character-option__image" aria-hidden="true">
                          <img src={characterAssets[characterKey].idle} alt="" />
                        </span>
                        <span className="onboarding-character-option__content">
                          <strong>{character.name}</strong>
                          <small>{character.summary}</small>
                          <span className="onboarding-character-option__tags">
                            {character.tags?.map((tag) => (
                              <Tag key={tag} variant="neutral">
                                {tag}
                              </Tag>
                            )) || null}
                          </span>
                        </span>
                        <span className="onboarding-character-option__check" aria-hidden="true">
                          <Check size={16} strokeWidth={2.4} />
                        </span>
                      </button>
                    );
                  })}
                </div>

                {selectedCharacter ? (
                  <div className="onboarding-flow__selected-note" aria-live="polite">
                    <strong>{selectedCharacter.sampleLine}</strong>
                    <p>{selectedCharacter.description || ""}</p>
                  </div>
                ) : null}
              </>
            ) : null}
          </section>

          <div className="onboarding-flow__actions">
            <Button disabled={!selectedCharacter} size="large" onClick={handleNext}>
              이 별친구로 시작하기
            </Button>
          </div>
        </div>
      </AppShell>
    </main>
  );
}

/** 온보딩 화면에서 로딩/에러 같은 단순 상태를 같은 레이아웃으로 보여줍니다. */
function OnboardingState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="onboarding-flow__state">
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  );
}
