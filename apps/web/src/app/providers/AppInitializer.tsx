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

export function AppInitializer({ children }: AppInitializerProps) {
  const hasSession = useAuthStore((state) => state.hasSession());
  const markCompleted = useOnboardingSetupStore((state) => state.markCompleted);
  const setCreatedCharacter = useOnboardingSetupStore((state) => state.setCreatedCharacter);
  const selectCharacter = useOnboardingSetupStore((state) => state.selectCharacter);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    async function initializeSession() {
      if (!hasSession) {
        setIsInitializing(false);
        return;
      }

      try {
        // Fetch onboarding profile and active character in parallel
        const [profile, activeCharacter] = await Promise.all([
          getOnboardingProfile().catch((err) => {
            console.error("Failed to fetch onboarding profile:", err);
            return null;
          }),
          getActiveCharacter().catch((err) => {
            // CHARACTER_NOT_FOUND error is expected if user doesn't have an active character yet
            console.warn("Active character not found or failed to fetch:", err);
            return null;
          }),
        ]);

        if (profile?.completed) {
          // If onboarding is completed on the backend, update frontend store
          markCompleted();
        }

        if (activeCharacter) {
          // If active character exists on the backend, fetch character types to map correctly
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
            states: {
              hunger: activeCharacter.states.hunger.value,
              energy: activeCharacter.states.energy.value,
              affection: activeCharacter.states.affection.value,
            },
            createdAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error("Error during session initialization:", err);
      } finally {
        setIsInitializing(false);
      }
    }

    initializeSession();
  }, [hasSession, markCompleted, selectCharacter, setCreatedCharacter]);

  if (isInitializing && hasSession) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: "var(--color-bg-primary, #FAF7F2)", // Default Latte bg1
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
