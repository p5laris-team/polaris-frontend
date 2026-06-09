/**
 * 별친구를 크게 보여주는 공통 무대 컴포넌트입니다.
 * 캐릭터 이미지, 이름, 말풍선, 상태 요약을 묶어 홈/돌봄/미션/온보딩에서 재사용합니다.
 */
import { type ReactNode } from "react";

import {
  characterAssets,
  type CharacterGrowthAssetLevel,
  type CharacterKey,
  type CharacterMood,
} from "@/shared/assets/polarisAssets";

import "./CharacterStage.css";

type StageStat = {
  label: string;
  value: string | number;
};

type CharacterStageProps = {
  character: CharacterKey;
  mood?: CharacterMood;
  imageUrl?: string;
  name: string;
  nameAccessory?: ReactNode;
  subLabel?: ReactNode;
  bubble?: string;
  stats?: StageStat[];
  onClick?: () => void;
  ariaLabel?: string;
  growthLevel?: CharacterGrowthAssetLevel | null;
};

export function CharacterStage({
  character,
  mood = "idle",
  imageUrl,
  name,
  nameAccessory,
  subLabel,
  bubble,
  stats = [],
  onClick,
  ariaLabel,
  growthLevel,
}: CharacterStageProps) {
  const imageClassName = [
    "character-stage__image",
    growthLevel ? `character-stage__image--${growthLevel}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <div className={imageClassName}>
        <img src={imageUrl ?? characterAssets[character][mood]} alt="" />
      </div>
      <div className="character-stage__identity">
        <div className="character-stage__name-row">
          <div className="character-stage__name">{name}</div>
          {nameAccessory ? <span className="character-stage__name-accessory">{nameAccessory}</span> : null}
        </div>
        {subLabel ? <div className="character-stage__sub-label">{subLabel}</div> : null}
      </div>
      {bubble ? <div className="character-stage__bubble">{bubble}</div> : null}
      {/*{stats.length ? (
        <div className="character-stage__stats" aria-label="캐릭터 요약">
          {stats.map((stat) => (
            <span className="character-stage__stat" key={stat.label}>
              {stat.label} {stat.value}
            </span>
          ))}
        </div>
      ) : null}*/}
    </>
  );

  if (onClick) {
    return (
      // 홈 캐릭터 영역처럼 상세 화면 진입점이 될 때는 같은 무대 스타일을 버튼으로 재사용한다.
      <button
        aria-label={ariaLabel ?? `${name} 캐릭터 자세히 보기`}
        className="character-stage character-stage--button"
        onClick={onClick}
        type="button"
      >
        {content}
      </button>
    );
  }

  return (
    // 홈/돌봄/완료 화면에서 캐릭터 이미지, 이름, 말풍선, 요약 상태를 묶어 보여준다.
    <section className="character-stage" aria-label={`${name} 캐릭터`}>
      {content}
    </section>
  );
}
