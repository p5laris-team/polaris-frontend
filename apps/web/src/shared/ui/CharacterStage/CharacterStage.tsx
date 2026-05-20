import { characterAssets, type CharacterKey, type CharacterMood } from "@/shared/assets/polarisAssets";

import "./CharacterStage.css";

type StageStat = {
  label: string;
  value: string | number;
};

type CharacterStageProps = {
  character: CharacterKey;
  mood?: CharacterMood;
  name: string;
  bubble?: string;
  stats?: StageStat[];
};

export function CharacterStage({
  character,
  mood = "idle",
  name,
  bubble,
  stats = [],
}: CharacterStageProps) {
  return (
    // 홈/돌봄/완료 화면에서 캐릭터 이미지, 이름, 말풍선, 요약 상태를 묶어 보여준다.
    <section className="character-stage" aria-label={`${name} 캐릭터`}>
      <div className="character-stage__image">
        <img src={characterAssets[character][mood]} alt="" />
      </div>
      <div className="character-stage__name">{name}</div>
      {bubble ? <div className="character-stage__bubble">{bubble}</div> : null}
      {stats.length ? (
        <div className="character-stage__stats" aria-label="캐릭터 요약">
          {stats.map((stat) => (
            <span className="character-stage__stat" key={stat.label}>
              {stat.label} {stat.value}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}
