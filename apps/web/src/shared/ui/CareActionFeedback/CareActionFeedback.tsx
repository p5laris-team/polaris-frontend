import { type CharacterMood } from "@/shared/assets/polarisAssets";

import "./CareActionFeedback.css";

export type CareActionFeedbackTone = "feed" | "sleep" | "play";

type CareActionFeedbackProps = {
  imageUrl: string;
  isOpen: boolean;
  mood: CharacterMood;
  tone: CareActionFeedbackTone;
};

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
