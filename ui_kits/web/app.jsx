/* ============================================================
   Polaris — Main App / Router + Tweaks
   ============================================================ */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "latte",
  "mode": "light",
  "fontDisplay": "suit"
}/*EDITMODE-END*/;

const initialMissions = [
  { id: 1, title: "물 한 잔 마시기",   sub: "기상 직후",     category: "morning", done: true },
  { id: 2, title: "5분 스트레칭",      sub: "진행중 · 2분",  category: "fitness", done: false, inProgress: true },
  { id: 3, title: "책 한 페이지",      sub: "취침 전",       category: "reading", done: false },
  { id: 4, title: "감사 일기 한 줄",   sub: "잠깐만 시간을", category: "mind",    done: false },
  { id: 5, title: "10분 명상",         sub: "조용한 곳에서", category: "mind",    done: false },
  { id: 6, title: "산책 20분",         sub: "햇볕 쬐기",      category: "fitness", done: false },
  { id: 7, title: "친구에게 안부",     sub: "한 줄이면 충분", category: "mind",    done: false, locked: true },
];

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Sync theme/mode to <html>
  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", tweaks.theme);
    document.documentElement.setAttribute("data-mode", tweaks.mode);
    document.documentElement.style.setProperty(
      "--font-display",
      tweaks.fontDisplay === "pretendard"
        ? "var(--font-sans)"
        : `"SUIT Variable", "Pretendard Variable", sans-serif`
    );
  }, [tweaks.theme, tweaks.mode, tweaks.fontDisplay]);

  // Flow state: which screen
  const [flow, setFlow] = React.useState("login"); // login | charSelect | onboarding | app
  const [tab, setTab] = React.useState("home");
  const [appView, setAppView] = React.useState("tabs"); // tabs | characterDetail | shop
  const [character, setCharacter] = React.useState(null);
  const [missions, setMissions] = React.useState(initialMissions);
  const [coins, setCoins] = React.useState(240);

  const toggleMission = (id) => {
    setMissions(ms => ms.map(m => {
      if (m.id !== id) return m;
      if (m.done) return { ...m, done: false };
      return { ...m, done: true, inProgress: false };
    }));
    const m = missions.find(x => x.id === id);
    if (m && !m.done) setCoins(c => c + 20);
  };

  const reset = () => {
    setFlow("login");
    setCharacter(null);
    setMissions(initialMissions);
    setCoins(240);
  };

  const renderInner = () => {
    if (flow === "login") {
      return <LoginScreen onLogin={() => setFlow("charSelect")} />;
    }
    if (flow === "charSelect") {
      return (
        <CharacterSelectScreen
          onBack={() => setFlow("login")}
          onNext={(id) => { setCharacter(id); setFlow("onboarding"); }}
        />
      );
    }
    if (flow === "onboarding") {
      return (
        <OnboardingScreen
          onBack={() => setFlow("charSelect")}
          onDone={() => setFlow("app")}
        />
      );
    }
    // flow === "app"
    if (appView === "characterDetail") {
      return <CharacterDetailScreen character={character} coins={coins} onBack={() => setAppView("tabs")} />;
    }
    if (appView === "shop") {
      return <ShopScreen coins={coins} onBack={() => setAppView("tabs")} />;
    }

    // tab content
    let content;
    if (tab === "home") {
      content = (
        <HomeScreen
          character={character}
          missions={missions}
          onToggleMission={toggleMission}
          onOpenMissions={() => setTab("missions")}
          onOpenCharacter={() => setAppView("characterDetail")}
        />
      );
    } else if (tab === "missions") {
      content = (
        <MissionListScreen
          missions={missions}
          onToggleMission={toggleMission}
          onAdd={() => {
            const id = Date.now();
            setMissions(ms => [...ms, { id, title: "새로운 미션", sub: "방금 추가됨", category: "morning", done: false }]);
          }}
        />
      );
    } else if (tab === "character") {
      content = (
        <div className="screen-enter" style={{ height: "100%" }}>
          <CharacterDetailScreen character={character} coins={coins} onBack={() => setTab("home")} />
        </div>
      );
    } else if (tab === "shop") {
      content = <ShopScreen coins={coins} onBack={() => setTab("home")} />;
    } else if (tab === "me") {
      content = (
        <div className="screen-enter">
          <Header title="나" />
          <div className="screen-body">
            <div className="card" style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 999, background: "var(--bg-character)", display: "grid", placeItems: "center", overflow: "hidden" }}>
                <img src={`../../assets/character-${character}.svg`} style={{ width: 56, height: 56 }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, color: "var(--fg-1)" }}>polaris_user</div>
                <div style={{ fontSize: 13, color: "var(--fg-3)" }}>별이와 7일째 함께</div>
              </div>
              <button className="icon-btn"><Icon name="settings" size={20}/></button>
            </div>

            <div className="card" style={{ marginBottom: 16, padding: 0 }}>
              {[
                { icon: "calendar", label: "통계 보기" },
                { icon: "heart",    label: "별이와의 추억" },
                { icon: "bell",     label: "알림 설정" },
                { icon: "book",     label: "가이드" },
              ].map((it, i, arr) => (
                <button key={it.label} className="icon-btn" style={{
                  width: "100%", height: "auto", justifyContent: "flex-start",
                  padding: "16px 20px", gap: 14, borderRadius: 0,
                  borderBottom: i < arr.length - 1 ? "1px solid var(--border-1)" : "0",
                  fontSize: 15, fontWeight: 600, color: "var(--fg-1)"
                }}>
                  <Icon name={it.icon} size={20} />
                  <span style={{ flex: 1, textAlign: "left" }}>{it.label}</span>
                  <Icon name="arrow-right" size={18} />
                </button>
              ))}
            </div>

            <Button variant="ghost" onClick={reset}>로그아웃</Button>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="screen">{content}</div>
        <BottomTabs active={tab} onChange={(k) => {
          if (k === "character") { setAppView("characterDetail"); return; }
          if (k === "shop")      { setAppView("shop"); return; }
          setAppView("tabs");
          setTab(k);
        }} />
      </>
    );
  };

  return (
    <>
      <AppShell>{renderInner()}</AppShell>

      <TweaksPanel title="Tweaks">
        <TweakSection label="테마" />
        <TweakRadio
          label="컬러 테마"
          value={tweaks.theme}
          onChange={v => setTweak("theme", v)}
          options={[
            { value: "latte", label: "Latte" },
            { value: "mint",  label: "Mint" },
            { value: "cloud", label: "Cloud" },
          ]}
        />
        <TweakRadio
          label="모드"
          value={tweaks.mode}
          onChange={v => setTweak("mode", v)}
          options={[
            { value: "light", label: "Light" },
            { value: "dark",  label: "Dark" },
          ]}
        />
        <TweakRadio
          label="디스플레이 폰트"
          value={tweaks.fontDisplay}
          onChange={v => setTweak("fontDisplay", v)}
          options={[
            { value: "suit",       label: "SUIT" },
            { value: "pretendard", label: "Pretendard" },
          ]}
        />
        <TweakSection label="프로토타입 흐름" />
        <TweakButton label="로그인부터" onClick={() => setFlow("login")} />
        <TweakButton label="캐릭터 선택부터" onClick={() => { setCharacter("byeori"); setFlow("charSelect"); }} />
        <TweakButton label="온보딩부터" onClick={() => { setCharacter("byeori"); setFlow("onboarding"); }} />
        <TweakButton label="홈으로 점프" onClick={() => { setCharacter(character || "byeori"); setFlow("app"); setTab("home"); setAppView("tabs"); }} />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
