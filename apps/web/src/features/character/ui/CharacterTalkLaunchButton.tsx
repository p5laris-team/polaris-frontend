/**
 * 별친구 대화 전용 화면으로 들어가는 로고형 진입 버튼입니다.
 */
import { talkAssets, type CharacterKey } from "@/shared/assets/polarisAssets";

import "./CharacterTalkLaunchButton.css";

type CharacterTalkLaunchButtonProps = {
  characterKey: CharacterKey;
  characterName: string;
  className?: string;
  onClick: () => void;
};

export function CharacterTalkLaunchButton({
  characterKey,
  characterName,
  className,
  onClick,
}: CharacterTalkLaunchButtonProps) {
  return (
    <button
      aria-label={`${characterName}와 대화하기`}
      className={["character-talk-launch", className ?? ""].filter(Boolean).join(" ")}
      onClick={onClick}
      type="button"
    >
      <img className="character-talk-launch__bg" src={talkAssets.panelBg} alt="" />
      <span className="character-talk-launch__mark" aria-hidden="true">
        <img src={talkAssets.bubbleSparkle} alt="" />
      </span>
      <span className="character-talk-launch__copy">
        <strong>대화하기</strong>
        <small>{characterName} 연결됨</small>
      </span>
      <span className="character-talk-launch__avatar" aria-hidden="true">
        <img src={getTalkAvatarAsset(characterKey)} alt="" />
      </span>
    </button>
  );
}

function getTalkAvatarAsset(characterKey: CharacterKey) {
  if (characterKey === "mumu") return talkAssets.avatarMumu;
  if (characterKey === "jjori") return talkAssets.avatarJjori;
  return talkAssets.avatarNova;
}
