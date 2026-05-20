/* ============================================================
   Polaris — Auth / Onboarding Screens
   ============================================================ */

/* ---------- 1. Login ---------- */
function LoginScreen({ onLogin }) {
  const [email, setEmail] = React.useState("");
  const [pw, setPw] = React.useState("");
  const [showEmail, setShowEmail] = React.useState(false);

  if (showEmail) {
    return (
      <>
        <Header title="이메일로 로그인" onBack={() => setShowEmail(false)} />
        <div className="screen-body screen-enter" style={{ paddingTop: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <TextField
              label="이메일"
              type="email"
              placeholder="hello@polaris.kr"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <TextField
              label="비밀번호"
              type="password"
              placeholder="8자 이상"
              value={pw}
              onChange={e => setPw(e.target.value)}
            />
          </div>
          <div style={{ marginTop: 28 }}>
            <Button onClick={onLogin} disabled={!email || pw.length < 8}>로그인</Button>
          </div>
          <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "var(--fg-3)" }}>
            아직 별친구를 만난 적이 없으세요? <a style={{ color: "var(--primary)" }}>가입하기</a>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="screen-enter" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="login-hero">
        <div className="logo">
          <img src="../../assets/logomark.svg" alt="Polaris" style={{ width: "100%", height: "100%" }} />
        </div>
        <h1>오늘부터 함께할 친구</h1>
        <p>매일의 작은 루틴이<br/>별친구를 자라게 해요.</p>
      </div>
      <div className="login-actions">
        <Button variant="kakao" onClick={onLogin}>
          <span style={{ fontSize: 18 }}>💬</span> 카카오로 시작하기
        </Button>
        <Button variant="google" onClick={onLogin}>
          <span style={{ fontWeight: 800, color: "#4285F4" }}>G</span> Google로 시작하기
        </Button>
        <div className="divider">또는</div>
        <Button variant="secondary" onClick={() => setShowEmail(true)}>이메일로 시작하기</Button>
        <div style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: "var(--fg-3)", lineHeight: 1.6 }}>
          가입 시 <a style={{ color: "var(--fg-2)", textDecoration: "underline" }}>서비스 약관</a> 및<br/>
          <a style={{ color: "var(--fg-2)", textDecoration: "underline" }}>개인정보 처리방침</a>에 동의하게 돼요.
        </div>
      </div>
    </div>
  );
}

/* ---------- 2. Character Select ---------- */
function CharacterSelectScreen({ onNext, onBack }) {
  const [selected, setSelected] = React.useState(null);

  const chars = [
    { id: "byeori",  name: "별이",   desc: "통통한 별친구" },
    { id: "gureumi", name: "구름이", desc: "부드러운 구름친구" },
    { id: "kongi",   name: "콩이",   desc: "새싹 친구" },
  ];

  return (
    <>
      <Header title="친구 고르기" onBack={onBack} />
      <div className="screen-body screen-enter">
        <div style={{ textAlign: "center", padding: "12px 0 20px" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--fg-1)" }}>
            함께할 친구를 골라볼까요?
          </h1>
          <p style={{ marginTop: 8, fontSize: 14, color: "var(--fg-3)" }}>
            나중에 친구가 늘어날 수도 있어요.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {chars.map(c => (
            <CharCard
              key={c.id}
              id={c.id}
              name={c.name}
              desc={c.desc}
              selected={selected === c.id}
              onClick={() => setSelected(c.id)}
            />
          ))}
        </div>

        {selected && (
          <div style={{ marginTop: 24, padding: 18, background: "var(--bg-2)", border: "1px solid var(--border-1)", borderRadius: 18 }}>
            <div className="stage-bubble" style={{ borderRadius: "18px 18px 18px 4px", marginBottom: 0, maxWidth: "100%" }}>
              {selected === "byeori" && "안녕하세요! 만나서 반가워요."}
              {selected === "gureumi" && "처음 뵙겠어요. 잘 지내봐요."}
              {selected === "kongi"   && "오늘부터 같이 자라봐요!"}
            </div>
          </div>
        )}

        <div style={{ marginTop: 24 }}>
          <Button onClick={() => onNext(selected)} disabled={!selected}>
            {selected ? "이 친구로 정할래요" : "친구를 골라주세요"}
          </Button>
        </div>
      </div>
    </>
  );
}

/* ---------- 3. Onboarding Survey ---------- */
function OnboardingScreen({ onDone, onBack }) {
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState({ goal: null, time: null, cats: [], notify: "20:00" });

  const goals = [
    { id: "wellness", label: "건강한 하루를 만들고 싶어요", sub: "수분 · 스트레칭 · 수면" },
    { id: "focus",    label: "집중력을 끌어올리고 싶어요",  sub: "독서 · 공부 · 정리" },
    { id: "calm",     label: "마음을 가꾸고 싶어요",         sub: "감사 일기 · 명상" },
    { id: "social",   label: "사람들과 더 가까워지고 싶어요",sub: "연락 · 안부" },
  ];
  const times = [
    { id: "morning", label: "아침형이에요",   sub: "6–10시 사이에 가장 활기차요" },
    { id: "day",     label: "낮에 잘 움직여요", sub: "10–18시" },
    { id: "evening", label: "저녁이 좋아요",   sub: "18시 이후가 편해요" },
  ];
  const cats = [
    { id: "morning", label: "아침 루틴", ill: "../../assets/cat-morning.svg" },
    { id: "fitness", label: "운동",      ill: "../../assets/cat-fitness.svg" },
    { id: "reading", label: "독서·공부", ill: "../../assets/cat-reading.svg" },
    { id: "mind",    label: "마음·감사", ill: "../../assets/cat-mind.svg" },
  ];

  const toggleCat = (id) => {
    setAnswers(a => ({
      ...a,
      cats: a.cats.includes(id) ? a.cats.filter(x => x !== id) : [...a.cats, id]
    }));
  };

  const canNext = () => {
    if (step === 0) return !!answers.goal;
    if (step === 1) return !!answers.time;
    if (step === 2) return answers.cats.length > 0;
    return true;
  };
  const next = () => {
    if (step < 2) setStep(s => s + 1);
    else onDone(answers);
  };

  return (
    <>
      <Header
        title="시작하기"
        onBack={step === 0 ? onBack : () => setStep(s => s - 1)}
      />
      <Dots total={3} current={step} />
      <div className="screen-body screen-enter" key={step} style={{ paddingTop: 4 }}>
        {step === 0 && (
          <>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--fg-1)" }}>
              어떤 하루를 보내고 싶으세요?
            </h1>
            <p style={{ marginTop: 8, marginBottom: 20, color: "var(--fg-3)", fontSize: 14 }}>
              가장 가까운 한 가지를 골라주세요.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {goals.map(g => (
                <SurveyOption
                  key={g.id}
                  label={g.label}
                  sub={g.sub}
                  selected={answers.goal === g.id}
                  onClick={() => setAnswers(a => ({ ...a, goal: g.id }))}
                />
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--fg-1)" }}>
              하루 중 언제가 가장 좋으세요?
            </h1>
            <p style={{ marginTop: 8, marginBottom: 20, color: "var(--fg-3)", fontSize: 14 }}>
              미션 시작 시간대를 정해드릴게요.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {times.map(t => (
                <SurveyOption
                  key={t.id}
                  label={t.label}
                  sub={t.sub}
                  selected={answers.time === t.id}
                  onClick={() => setAnswers(a => ({ ...a, time: t.id }))}
                />
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--fg-1)" }}>
              관심 카테고리를 골라주세요
            </h1>
            <p style={{ marginTop: 8, marginBottom: 20, color: "var(--fg-3)", fontSize: 14 }}>
              여러 개 선택할 수 있어요. ({answers.cats.length}개)
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {cats.map(c => (
                <SurveyOption
                  key={c.id}
                  illustration={c.ill}
                  label={c.label}
                  selected={answers.cats.includes(c.id)}
                  onClick={() => toggleCat(c.id)}
                />
              ))}
            </div>
          </>
        )}

        <div style={{ marginTop: 32 }}>
          <Button onClick={next} disabled={!canNext()}>
            {step < 2 ? "다음" : "함께 시작하기"}
          </Button>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { LoginScreen, CharacterSelectScreen, OnboardingScreen });
