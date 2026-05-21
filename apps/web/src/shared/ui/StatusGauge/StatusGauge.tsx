import "./StatusGauge.css";

type StatusGaugeProps = {
  label: string;
  showLabel?: boolean;
  value: number;
  tone?: "good" | "normal" | "bad";
};

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
