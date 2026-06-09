/**
 * 캐릭터 성장/경험치 정보를 보여주는 작은 공통 UI입니다.
 * 백엔드 growth 응답과 성장 배지/오라/EXP 이펙트 에셋을 함께 매핑합니다.
 */
import { type CharacterGrowth } from "@/entities/character/types";
import {
  effectAssets,
  growthAssets,
  type GrowthStageKey,
} from "@/shared/assets/polarisAssets";

import "./CharacterGrowthMeter.css";

type CharacterGrowthMeterProps = {
  className?: string;
  growth: CharacterGrowth | null | undefined;
  variant?: "floating" | "detail";
};

export function CharacterGrowthMeter({
  className,
  growth,
  variant = "detail",
}: CharacterGrowthMeterProps) {
  if (!growth) {
    return null;
  }

  const stageKey = toGrowthStageKey(growth.growthStage);
  const progressPercent = clampPercent(growth.progressPercent);
  const progress = getGrowthProgress(growth);
  const rootClassName = [
    "character-growth-meter",
    `character-growth-meter--${variant}`,
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={rootClassName}
      aria-label={`${growth.growthStageLabel} 레벨 ${growth.level}, 경험치 ${progressPercent}%`}
    >
      <span className="character-growth-meter__badge" aria-hidden="true">
        <img className="character-growth-meter__aura" src={growthAssets.auras[stageKey]} alt="" />
        <img className="character-growth-meter__badge-image" src={growthAssets.badges[stageKey]} alt="" />
      </span>

      <span className="character-growth-meter__copy">
        <span className="character-growth-meter__head">
          <strong>Lv.{growth.level}</strong>
          <em>{growth.growthStageLabel}</em>
        </span>
        <span className="character-growth-meter__track" aria-hidden="true">
          <i style={{ width: `${progressPercent}%` }} />
        </span>
        <span className="character-growth-meter__meta">
          {growth.maxLevel ? "최대 성장" : `${progress.current}/${progress.required} EXP`}
        </span>
      </span>

      {variant === "detail" ? (
        <span className="character-growth-meter__next">
          <img src={effectAssets.expOrb} alt="" />
          <span>
            {growth.maxLevel
              ? "지금은 모든 성장을 채웠어요."
              : `다음 레벨까지 ${growth.expToNextLevel} EXP`}
          </span>
        </span>
      ) : null}
    </div>
  );
}

function toGrowthStageKey(stage: string | null | undefined): GrowthStageKey {
  const normalized = `${stage ?? ""}`.toUpperCase();

  if (normalized === "GROWING") {
    return "growing";
  }

  if (normalized === "MATURE") {
    return "mature";
  }

  return "baby";
}

function clampPercent(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function getGrowthProgress(growth: CharacterGrowth) {
  const required = Math.max(0, growth.nextLevelExp - growth.currentLevelExp);
  const current = growth.maxLevel
    ? required
    : Math.max(0, Math.min(required, growth.exp - growth.currentLevelExp));

  return {
    current,
    required,
  };
}
