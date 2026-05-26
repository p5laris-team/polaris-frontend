import { type ReactNode, useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useOnboardingSetupStore } from "@/features/onboarding/model/onboardingStore";
import { getOnboardingProfile } from "@/features/onboarding/api/onboardingApi";
import { getActiveCharacter } from "@/features/character/api/characterCareApi";
import { getCharacterTypes } from "@/features/onboarding/api/characterSetupApi";
import { toCharacterTypeId } from "@/entities/character/types";
import { type CharacterTypeSummary } from "@/features/onboarding/model/onboardingTypes";

type AppInitializerProps = {
  children: ReactNode;
};

/**
 * 로그인 세션이 있을 때 백엔드의 온보딩/활성 캐릭터 상태를 먼저 불러옵니다.
 * 새로고침 후에도 사용자가 캐릭터 선택부터 다시 시작하지 않도록 Zustand store를 복원하는 역할입니다.
 */
export function AppInitializer({ children }: AppInitializerProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasSession = !!accessToken;
  const markCompleted = useOnboardingSetupStore((state) => state.markCompleted);
  const setCreatedCharacter = useOnboardingSetupStore((state) => state.setCreatedCharacter);
  const selectCharacter = useOnboardingSetupStore((state) => state.selectCharacter);

  const [initializedToken, setInitializedToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isInitializing = hasSession && (initializedToken !== accessToken || isLoading);

  useEffect(() => {
    /**
     * 로그인한 사용자의 온보딩 완료 여부와 활성 캐릭터를 병렬로 조회합니다.
     * 일부 조회가 실패해도 앱 전체 진입을 막지 않기 위해 각 요청은 개별 fallback을 둡니다.
     */
    async function initializeSession() {
      if (!accessToken) {
        setInitializedToken(null);
        return;
      }

      setIsLoading(true);
      try {
        // 온보딩 프로필과 활성 캐릭터는 서로 독립적이라 초기 진입 시간을 줄이기 위해 병렬로 조회한다.
        const [profile, activeCharacter] = await Promise.all([
          getOnboardingProfile().catch((err) => {
            console.error("Failed to fetch onboarding profile:", err);
            return null;
          }),
          getActiveCharacter().catch((err) => {
            // 아직 캐릭터를 만들지 않은 사용자는 CHARACTER_NOT_FOUND가 자연스러운 상태라 null로 처리한다.
            console.warn("Active character not found or failed to fetch:", err);
            return null;
          }),
        ]);

        if (profile?.completed) {
          // 백엔드 기준 온보딩 완료 상태를 프론트 store에도 반영한다.
          markCompleted();
        }

        if (activeCharacter) {
          // 활성 캐릭터가 있으면 캐릭터 타입 목록을 함께 조회해 카드/이미지 매핑에 필요한 메타데이터를 맞춘다.
          let matchedType: CharacterTypeSummary | null = null;
          try {
            const typesRes = await getCharacterTypes();
            const items = typesRes?.items || [];
            matchedType = items.find((item) => item.code === activeCharacter.characterTypeCode) || null;
          } catch (typesErr) {
            console.error("Failed to fetch character types:", typesErr);
          }

          const characterTypeId = matchedType?.id ?? toCharacterTypeId(activeCharacter.characterTypeCode) ?? 1;

          const selectedChar: CharacterTypeSummary = matchedType || {
            id: characterTypeId,
            code: activeCharacter.characterTypeCode,
            name: activeCharacter.name,
            summary: "",
            sampleLine: "",
            sortOrder: 0,
            tags: [],
            description: "",
          };

          selectCharacter(selectedChar);
          setCreatedCharacter({
            id: activeCharacter.id,
            name: activeCharacter.name,
            characterTypeCode: activeCharacter.characterTypeCode,
            active: activeCharacter.id > 0,
            states: activeCharacter.states
              ? {
                  hunger: activeCharacter.states.hunger?.value ?? 0,
                  energy: activeCharacter.states.energy?.value ?? 0,
                  affection: activeCharacter.states.affection?.value ?? 0,
                }
              : {
                  hunger: 0,
                  energy: 0,
                  affection: 0,
                },
            createdAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error("Error during session initialization:", err);
      } finally {
        setInitializedToken(accessToken);
        setIsLoading(false);
      }
    }

    initializeSession();
  }, [accessToken, markCompleted, selectCharacter, setCreatedCharacter]);

  if (isInitializing && hasSession) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: "var(--color-bg-primary, #FAF7F2)", // 디자인 토큰이 없을 때도 라떼 배경색으로 보이게 하는 fallback이다.
          fontFamily: "SUIT, sans-serif",
          color: "var(--color-text-primary, #2d3748)",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "4px solid var(--color-bg-secondary, #E2E8F0)",
            borderTop: "4px solid var(--color-primary, #6B46C1)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{ marginTop: "16px", fontSize: "1.05rem", fontWeight: "600" }}>
          별친구의 흔적을 찾는 중...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
