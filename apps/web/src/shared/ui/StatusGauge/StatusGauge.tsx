/**
 * 캐릭터 상태 수치를 0~100 막대 게이지로 보여주는 공통 컴포넌트입니다.
 * hunger, energy, affection처럼 같은 패턴의 상태 표시에서 사용합니다.
 */
import "./StatusGauge.css";

type StatusGaugeProps = {
  label: string;
  showLabel?: boolean;
  value: number;
  tone?: "good" | "normal" | "bad";
};

/** value를 0~100으로 보정해 CSS width와 접근성 라벨에 같은 값을 사용합니다. */
export function StatusGauge({ label, showLabel = true, value, tone = "normal" }: StatusGaugeProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={`status-gauge status-gauge--${tone}`} aria-label={`${label} ${clamped}%`}>
      {showLabel ? (
        <div className="status-gauge__row">
          <span>{label}</span>
          <strong>{clamped}%</strong>
        </div>
      ) : null}
      <div className="status-gauge__track" aria-hidden="true">
        <div className="status-gauge__bar" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
