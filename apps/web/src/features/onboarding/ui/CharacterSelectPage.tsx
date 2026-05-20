import { type ReactNode } from "react";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { toCharacterKey } from "@/entities/character/types";
import { useCharacterTypesQuery } from "@/features/onboarding/api/characterSetupApi";
import { useOnboardingSetupStore } from "@/features/onboarding/model/onboardingStore";
import { routes } from "@/routes/paths";
import { getUserFacingErrorMessage } from "@/shared/api";
import { characterAssets } from "@/shared/assets/polarisAssets";
import { AppShell, Button, Header, Tag, useToast } from "@/shared/ui";

import "./OnboardingFlow.css";

export function CharacterSelectPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const characterTypesQuery = useCharacterTypesQuery();
  const selectedCharacter = useOnboardingSetupStore((state) => state.selectedCharacter);
  const selectCharacter = useOnboardingSetupStore((state) => state.selectCharacter);

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
              <p>각 별친구는 같은 온보딩 정책을 따르지만, 말투와 응원 방식이 조금씩 달라요.</p>
            </div>

            {characterTypesQuery.isLoading ? (
              <OnboardingState title="별친구를 불러오는 중" description="잠깐만 기다려 주세요." />
            ) : null}

            {characterTypesQuery.isError ? (
              <OnboardingState
                title="별친구 목록을 못 불러왔어요"
                description={getUserFacingErrorMessage(characterTypesQuery.error)}
                action={<Button onClick={() => void characterTypesQuery.refetch()}>다시 불러오기</Button>}
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
                            {character.tags.map((tag) => (
                              <Tag key={tag} variant="neutral">
                                {tag}
                              </Tag>
                            ))}
                          </span>
                        </span>
                        <span className="onboarding-character-option__check" aria-hidden="true">
                          <Check size={16} strokeWidth={2.4} />
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="onboarding-flow__selected-note" aria-live="polite">
                  {selectedCharacter ? (
                    <>
                      <strong>{selectedCharacter.sampleLine}</strong>
                      <p>{selectedCharacter.description}</p>
                    </>
                  ) : (
                    <>
                      <strong>아직 선택하지 않았어요.</strong>
                      <p>마음에 드는 별친구를 누르면 이름을 지어 줄 수 있어요.</p>
                    </>
                  )}
                </div>
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
