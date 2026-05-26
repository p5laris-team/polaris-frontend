/**
 * 돌봄 성공 직후 잠깐 뜨는 캐릭터 반응 오버레이입니다.
 * 먹이/잠/놀이 액션마다 다른 배경 톤과 캐릭터 mood를 보여줍니다.
 */
import { type CharacterMood } from "@/shared/assets/polarisAssets";

import "./CareActionFeedback.css";

export type CareActionFeedbackTone = "feed" | "sleep" | "play";

type CareActionFeedbackProps = {
  imageUrl: string;
  isOpen: boolean;
  mood: CharacterMood;
  tone: CareActionFeedbackTone;
};

/** isOpen이 false이면 DOM을 만들지 않고, true일 때 status 영역으로 짧은 피드백을 노출합니다. */
export function CareActionFeedback({
  imageUrl,
  isOpen,
  mood,
  tone,
}: CareActionFeedbackProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className={`care-action-feedback care-action-feedback--${tone}`}
      role="status"
    >
      <div className="care-action-feedback__backdrop" />
      <div className="care-action-feedback__character-wrap">
        <img
          alt=""
          className={`care-action-feedback__character care-action-feedback__character--${mood}`}
          src={imageUrl}
        />
      </div>
    </div>
  );
}
