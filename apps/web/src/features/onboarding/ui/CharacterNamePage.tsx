/**
 * 온보딩 2단계, 별친구 이름 설정 화면입니다.
 * 선택한 캐릭터 타입에 사용자가 지은 이름을 붙여 실제 캐릭터 생성 API를 호출합니다.
 */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { toCharacterKey } from "@/entities/character/types";
import { useCreateCharacterMutation } from "@/features/onboarding/api/characterSetupApi";
import { useOnboardingSetupStore } from "@/features/onboarding/model/onboardingStore";
import { routes } from "@/routes/paths";
import { getUserFacingErrorMessage } from "@/shared/api";
import { AppShell, Button, CharacterStage, Header, TextField, useToast } from "@/shared/ui";

import "./OnboardingFlow.css";

const MAX_CHARACTER_NAME_LENGTH = 10;

export function CharacterNamePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const selectedCharacter = useOnboardingSetupStore((state) => state.selectedCharacter);
  const createdCharacter = useOnboardingSetupStore((state) => state.createdCharacter);
  const setCreatedCharacter = useOnboardingSetupStore((state) => state.setCreatedCharacter);
  const createCharacterMutation = useCreateCharacterMutation();
  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);

  const trimmedName = name.trim();
  const nameError = useMemo(() => {
    if (!touched) return "";
    if (!trimmedName) return "이름을 1자 이상 입력해 주세요.";
    if (trimmedName.length > MAX_CHARACTER_NAME_LENGTH) return "이름은 10자 이하로 지어 주세요.";

    return "";
  }, [touched, trimmedName]);

  useEffect(() => {
    if (createdCharacter) {
      navigate(routes.onboardingQuestions, { replace: true });
      return;
    }

    if (!selectedCharacter) {
      navigate(routes.onboardingCharacter, { replace: true });
    }
  }, [createdCharacter, navigate, selectedCharacter]);

  /** 이름 길이 정책을 먼저 검증한 뒤 캐릭터 생성 API를 호출합니다. */
  const handleSubmit = async () => {
    setTouched(true);

    if (!selectedCharacter) {
      navigate(routes.onboardingCharacter, { replace: true });
      return;
    }

    if (!trimmedName || trimmedName.length > MAX_CHARACTER_NAME_LENGTH) {
      showToast("별친구 이름을 1~10자로 입력해 주세요.");
      return;
    }

    try {
      const character = await createCharacterMutation.mutateAsync({
        characterTypeId: selectedCharacter.id,
        name: trimmedName,
      });

      setCreatedCharacter(character);
      showToast(`${trimmedName}와 같이 시작해요.`);
      navigate(routes.onboardingQuestions);
    } catch (error) {
      showToast(getUserFacingErrorMessage(error));
    }
  };

  if (!selectedCharacter) {
    return null;
  }

  const characterKey = toCharacterKey(selectedCharacter.code);
  const previewName = trimmedName || selectedCharacter.name;

  return (
    <main className="onboarding-page">
      <AppShell>
        <div className="onboarding-flow">
          <Header title="이름 정하기" onBack={() => navigate(routes.onboardingCharacter)} />

          <section className="onboarding-flow__body">
            {/* SCR-004 캐릭터 이름 설정: create character API의 name 1~10자 정책을 화면에서 먼저 검증한다. */}
            <div className="onboarding-flow__hero">
              <span className="onboarding-flow__eyebrow">STEP 2</span>
              <h1>{selectedCharacter.name}에게 부를 이름을 지어 주세요.</h1>
              <p>이 이름은 홈, 미션 완료, 돌봄 화면에서 계속 보여질 예정이에요.</p>
            </div>

            <div className="onboarding-name-panel">
              <CharacterStage
                bubble={getNameReaction(trimmedName, selectedCharacter.sampleLine)}
                character={characterKey}
                mood={trimmedName ? "happy" : "idle"}
                name={previewName}
              />

              <div>
                <TextField
                  autoComplete="off"
                  error={nameError || undefined}
                  id="character-name"
                  label="별친구 이름"
                  maxLength={MAX_CHARACTER_NAME_LENGTH}
                  onBlur={() => setTouched(true)}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="예: 작은무무"
                  value={name}
                />
                <span className="onboarding-name-panel__counter">
                  {trimmedName.length}/{MAX_CHARACTER_NAME_LENGTH}
                </span>
              </div>

              <p className="onboarding-name-panel__guide">
                이 이름은 별친구를 처음 만들 때 저장돼요. 나중에 이름 변경 기능이 열리면 설정에서
                다시 바꿀 수 있어요.
              </p>
            </div>
          </section>

          <div className="onboarding-flow__actions">
            <Button disabled={createCharacterMutation.isPending} size="large" onClick={handleSubmit}>
              {createCharacterMutation.isPending ? "별친구를 부르는 중..." : "이름 정하고 다음으로"}
            </Button>
          </div>
        </div>
      </AppShell>
    </main>
  );
}

/** 입력 중인 이름이 있으면 말풍선에서 즉시 반응하도록 문장을 만듭니다. */
function getNameReaction(name: string, fallback: string) {
  if (!name) return fallback;

  return `${name}... 좋은 이름 같아요.`;
}
