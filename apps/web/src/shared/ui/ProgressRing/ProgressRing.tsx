/**
 * 원형 진행률 컴포넌트입니다.
 * SVG strokeDashoffset으로 진행률을 표현해 크기와 두께를 props로 조절할 수 있습니다.
 */
import "./ProgressRing.css";

type ProgressRingProps = {
  value: number;
  label: string;
  size?: number;
  stroke?: number;
};

/** value를 0~100으로 보정한 뒤 원 둘레 계산으로 채워진 비율을 만듭니다. */
export function ProgressRing({ value, label, size = 110, stroke = 10 }: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--bg-3)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="progress-ring__center">
        <strong>{clamped}%</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}
