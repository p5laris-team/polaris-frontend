/* ============================================================
   Polaris — Shared UI Components
   ============================================================ */

const { useState, useEffect, useRef } = React;

/* ----------- Layout: App Shell ----------- */
function AppShell({ children }) {
  return (
    <div className="frame-bg">
      <div className="app-shell">{children}</div>
    </div>
  );
}

/* ----------- Header ----------- */
function Header({ title, left, right, onBack }) {
  return (
    <div className="header">
      {onBack ? (
        <button className="icon-btn" onClick={onBack} aria-label="뒤로">
          <Icon name="arrow-left" size={22} />
        </button>
      ) : left ? left : <div className="header-spacer" />}
      <div className="header-title">{title}</div>
      {right ? right : <div className="header-spacer" />}
    </div>
  );
}

/* ----------- Button ----------- */
function Button({ variant = "primary", size, children, onClick, disabled, type = "button", className = "", ...rest }) {
  const classes = ["btn", `btn-${variant}`, size === "large" ? "btn-large" : "", className].filter(Boolean).join(" ");
  return (
    <button className={classes} onClick={onClick} disabled={disabled} type={type} {...rest}>
      {children}
    </button>
  );
}

/* ----------- Text Field ----------- */
function TextField({ label, hint, error, ...rest }) {
  return (
    <label className="field">
      {label && <span className="field-label">{label}</span>}
      <input className="field-input" {...rest} />
      {(hint || error) && <span className={`field-hint ${error ? "error" : ""}`}>{error || hint}</span>}
    </label>
  );
}

/* ----------- Chip ----------- */
function Chip({ selected, children, onClick }) {
  return (
    <button className={`chip ${selected ? "selected" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}

/* ----------- Mission Card ----------- */
function MissionCard({ mission, onToggle }) {
  const { title, sub, category, done, inProgress, locked } = mission;
  const catImg = {
    morning: "../../assets/cat-morning.svg",
    fitness: "../../assets/cat-fitness.svg",
    reading: "../../assets/cat-reading.svg",
    mind: "../../assets/cat-mind.svg",
  }[category] || "../../assets/cat-morning.svg";

  return (
    <button
      className={`mission ${done ? "done" : ""} ${inProgress ? "in-progress" : ""} ${locked ? "locked" : ""}`}
      onClick={() => !locked && onToggle?.(mission.id)}
    >
      <div className="cat-icon"><img src={catImg} alt="" /></div>
      <div className="body">
        <div className="title">{title}</div>
        <div className="sub">{locked ? <><Icon name="lock" size={12} style={{verticalAlign: "-2px"}}/> {sub}</> : sub}</div>
      </div>
      <div className="check">{done ? "✓" : inProgress ? "▸" : ""}</div>
    </button>
  );
}

/* ----------- Character Stage ----------- */
function CharacterStage({ character, name, level, bubble, hearts = 78, coins = 240, streak = 7 }) {
  const charId = character || "nova";
  const ext = ["nova", "jjori", "mumu"].includes(charId) ? "png" : "svg";
  const moodImg = `../../assets/character-${charId}.${ext}`;
  return (
    <div className="stage">
      <div className="character-img">
        <img src={moodImg} alt="" style={{ width: "100%", height: "100%" }} />
      </div>
      <div className="stage-name">{name} {level && `· Lv.${level}`}</div>
      {bubble && <div className="stage-bubble">{bubble}</div>}
      <div className="stage-stats">
        <span className="stage-stat">♡ {hearts}%</span>
        <span className="stage-stat">✦ {coins}</span>
        <span className="stage-stat">{streak}일 연속</span>
      </div>
    </div>
  );
}

/* ----------- Progress Ring ----------- */
function ProgressRing({ value = 0, label = "오늘", num, size = 110, stroke = 10 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - value / 100);
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg-3)" strokeWidth={stroke} />
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none" stroke="var(--primary)" strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s var(--ease-out)" }}
        />
      </svg>
      <div className="ring-center">
        <div>
          <div className="num">{num != null ? num : `${value}%`}</div>
          <div className="lbl">{label}</div>
        </div>
      </div>
    </div>
  );
}

/* ----------- Bottom Tabs ----------- */
function BottomTabs({ active, onChange }) {
  const tabs = [
    { key: "home", label: "홈", icon: "home" },
    { key: "missions", label: "미션", icon: "list" },
    { key: "character", label: "별이", icon: "star" },
    { key: "shop", label: "상점", icon: "shop" },
    { key: "me", label: "나", icon: "user" },
  ];
  return (
    <div className="bottom-tabs">
      {tabs.map(t => (
        <button key={t.key} className={`tab ${active === t.key ? "active" : ""}`} onClick={() => onChange(t.key)}>
          <Icon name={t.icon} size={22} />
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ----------- Section Title ----------- */
function SectionTitle({ children, action, onAction }) {
  return (
    <div className="section-title">
      <h2>{children}</h2>
      {action && <a onClick={onAction}>{action}</a>}
    </div>
  );
}

/* ----------- Streak Track ----------- */
function StreakTrack({ days = ["월","화","수","목","금","토","일"], doneCount = 4, todayIndex = 4 }) {
  return (
    <div className="streak">
      {days.map((d, i) => {
        let cls = "day";
        if (i < doneCount) cls += " done";
        if (i === todayIndex) cls += " today";
        return <div key={d} className={cls}>{d}</div>;
      })}
    </div>
  );
}

/* ----------- Currency Badge ----------- */
function Coin({ amount }) {
  return <span className="coin">{amount.toLocaleString()}</span>;
}

/* ----------- Tag ----------- */
function Tag({ children, variant }) {
  return <span className={`tag ${variant === "accent" ? "tag-accent" : ""}`}>{children}</span>;
}

/* ----------- Survey Option ----------- */
function SurveyOption({ illustration, label, sub, selected, onClick }) {
  return (
    <button className={`survey-opt ${selected ? "selected" : ""}`} onClick={onClick}>
      {illustration && <div className="ill"><img src={illustration} alt="" /></div>}
      <div style={{ flex: 1 }}>
        <div className="label">{label}</div>
        {sub && <div className="sub">{sub}</div>}
      </div>
      <div className="check-circle">{selected ? "✓" : ""}</div>
    </button>
  );
}

/* ----------- Dots progress (onboarding) ----------- */
function Dots({ total, current }) {
  return (
    <div className="dots">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`dot ${i === current ? "active" : ""}`} />
      ))}
    </div>
  );
}

/* ----------- Character Select Card ----------- */
function CharCard({ id, name, desc, selected, onClick }) {
  const ext = ["nova", "jjori", "mumu"].includes(id) ? "png" : "svg";
  return (
    <button className={`char-card ${selected ? "selected" : ""}`} onClick={onClick}>
      <img src={`../../assets/character-${id}.${ext}`} alt="" />
      <div className="name">{name}</div>
      <div className="desc">{desc}</div>
    </button>
  );
}

/* ----------- Modal (Popup) ----------- */
function Modal({ isOpen, title, children, onConfirm, onCancel, confirmText = "확인", cancelText = "취소" }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}>
      <div className="modal-card">
        {title && <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--fg-1)", marginBottom: 12 }}>{title}</h3>}
        <div style={{ fontSize: 14, color: "var(--fg-2)", marginBottom: 20, lineHeight: 1.5 }}>{children}</div>
        <div style={{ display: "flex", gap: 10 }}>
          {onCancel && <Button variant="secondary" onClick={onCancel}>{cancelText}</Button>}
          <Button variant="primary" onClick={onConfirm}>{confirmText}</Button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  AppShell, Header, Button, TextField, Chip, MissionCard, CharacterStage,
  ProgressRing, BottomTabs, SectionTitle, StreakTrack, Coin, Tag,
  SurveyOption, Dots, CharCard, Modal
});
