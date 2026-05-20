/* ============================================================
   Polaris — MVP App / Router + Local State Store
   ============================================================ */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "latte",
  "mode": "light",
  "fontDisplay": "suit"
}/*EDITMODE-END*/;

const TODAY = "2026-05-20";

const missionTemplates = [
  { id: "m-01", title: "물 한 잔 천천히 마시기", sub: "기상 직후 몸 깨우기", category: "morning", intensity: "LIGHT", duration: "1분", reward: 10 },
  { id: "m-02", title: "5분 스트레칭하기", sub: "어깨와 목부터 가볍게", category: "fitness", intensity: "LIGHT", duration: "5분", reward: 10 },
  { id: "m-03", title: "책 한 페이지 읽기", sub: "분량보다 시작을 챙기기", category: "reading", intensity: "NORMAL", duration: "7분", reward: 12 },
  { id: "m-04", title: "감사한 일 한 줄 적기", sub: "오늘의 작은 장면 기록", category: "mind", intensity: "LIGHT", duration: "3분", reward: 10 },
  { id: "m-05", title: "방 한 구역 정리하기", sub: "책상 위 한 뼘만 비우기", category: "mind", intensity: "NORMAL", duration: "10분", reward: 12 },
  { id: "m-06", title: "햇빛 보며 10분 걷기", sub: "집 앞도 충분한 산책", category: "fitness", intensity: "NORMAL", duration: "10분", reward: 12 },
  { id: "m-07", title: "잠들기 전 화면 내려놓기", sub: "눈이 쉬는 시간 만들기", category: "mind", intensity: "CHALLENGE", duration: "15분", reward: 15 },
  { id: "m-08", title: "친구에게 안부 남기기", sub: "짧은 한 줄이면 충분", category: "mind", intensity: "NORMAL", duration: "3분", reward: 12 },
  { id: "m-09", title: "아침 이불 정리하기", sub: "하루의 첫 완료감", category: "morning", intensity: "LIGHT", duration: "2분", reward: 10 },
  { id: "m-10", title: "계단 한 층 오르기", sub: "몸에 작은 신호 주기", category: "fitness", intensity: "CHALLENGE", duration: "4분", reward: 15 },
  { id: "m-11", title: "내일 할 일 하나 고르기", sub: "미리 가볍게 정해두기", category: "mind", intensity: "LIGHT", duration: "2분", reward: 10 },
  { id: "m-12", title: "좋았던 문장 저장하기", sub: "읽던 글에서 한 줄만", category: "reading", intensity: "NORMAL", duration: "5분", reward: 12 },
  { id: "m-13", title: "창문 열고 숨 고르기", sub: "공기 한 번 바꾸기", category: "morning", intensity: "LIGHT", duration: "1분", reward: 10 },
  { id: "m-14", title: "가벼운 스쿼트 10회", sub: "무리하지 않고 천천히", category: "fitness", intensity: "CHALLENGE", duration: "4분", reward: 15 },
  { id: "m-15", title: "오늘의 기분 이름 붙이기", sub: "한 단어로 충분해요", category: "mind", intensity: "LIGHT", duration: "2분", reward: 10 },
];

const initialUser = { nickname: "별따라걷기", email: "user@example.com" };
const initialCharacter = { type: "nova", name: "작은노바", fullness: 80, energy: 55, affection: 35, skin: null };
const initialWallet = {
  starPieces: 240,
  history: [
    { type: "초기 별조각 지급", amount: 240, timestamp: "2026-05-20 09:00" },
  ],
};
const initialNotifications = [
  { id: 1, type: "MISSION", title: "새 미션이 도착했어요", text: "노바가 오늘의 작은 시작을 골라왔어요.", timestamp: "방금", unread: true },
  { id: 2, type: "ALERT", title: "애정이 낮아지고 있어요", text: "잠깐 말을 걸어주면 금방 가까워질 거예요.", timestamp: "1시간 전", unread: true },
  { id: 3, type: "ATTENDANCE", title: "출석 도장을 찍을 수 있어요", text: "오늘도 별친구와 만난 기록을 남겨보세요.", timestamp: "오늘 오전", unread: false },
];

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

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

  const [flow, setFlow] = React.useState("login");
  const [tab, setTab] = React.useState("home");
  const [appView, setAppView] = React.useState("tabs");
  const [user] = React.useState(initialUser);
  const [selectedCharacterType, setSelectedCharacterType] = React.useState("nova");
  const [character, setCharacter] = React.useState(initialCharacter);
  const [wallet, setWallet] = React.useState(initialWallet);
  const [inventory, setInventory] = React.useState([]);
  const [missionIndex, setMissionIndex] = React.useState(1);
  const [activeMission, setActiveMission] = React.useState(missionTemplates[0]);
  const [missionHistory, setMissionHistory] = React.useState([]);
  const [completedToday, setCompletedToday] = React.useState(0);
  const [pendingCompletedMission, setPendingCompletedMission] = React.useState(null);
  const [earnedStarPieces, setEarnedStarPieces] = React.useState(0);
  const [notifications, setNotifications] = React.useState(initialNotifications);
  const [attendanceDates, setAttendanceDates] = React.useState(["2026-05-16", "2026-05-17", "2026-05-18", "2026-05-19"]);
  const [attendanceStreak, setAttendanceStreak] = React.useState(4);
  const [shareRewardClaimedToday, setShareRewardClaimedToday] = React.useState(false);
  const [toasts, setToasts] = React.useState([]);

  const showToast = (message) => {
    const id = Date.now() + Math.random();
    setToasts(ts => [...ts, { id, message }]);
    window.setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 2200);
  };

  const addWalletTx = (type, amount) => {
    setWallet(w => ({
      starPieces: w.starPieces + amount,
      history: [
        { type, amount, timestamp: "2026-05-20 12:00" },
        ...w.history,
      ],
    }));
  };

  const advanceMission = () => {
    if (missionIndex >= 15) {
      setActiveMission(null);
      return;
    }
    setActiveMission(missionTemplates[missionIndex]);
    setMissionIndex(i => i + 1);
  };

  const rejectMission = () => {
    if (!activeMission) return;
    setMissionHistory(h => [
      { ...activeMission, status: "REJECTED", timestamp: "방금" },
      ...h,
    ]);
    showToast("다른 미션을 골라왔어요.");
    advanceMission();
  };

  const completeMissionStart = () => {
    if (!activeMission) return;
    setPendingCompletedMission(activeMission);
    setAppView("missionAnswer");
  };

  const submitMissionAnswer = (answer) => {
    const mission = pendingCompletedMission || activeMission;
    if (!mission) return;
    const reward = mission.reward || 10;
    setMissionHistory(h => [
      { ...mission, status: "COMPLETED", answer, timestamp: "방금" },
      ...h,
    ]);
    setCompletedToday(c => c + 1);
    setCharacter(c => ({ ...c, affection: Math.min(100, c.affection + 5) }));
    addWalletTx("미션 완료 보상", reward);
    setEarnedStarPieces(reward);
    setPendingCompletedMission(mission);
    advanceMission();
    setAppView("missionResult");
  };

  const useCareAction = (actionType) => {
    if (actionType === "SLEEP") {
      setCharacter(c => ({ ...c, energy: Math.min(100, c.energy + 30) }));
      return { success: true, message: `${character.name}가 푹 쉬었어요. 기운 +30` };
    }

    if (actionType === "FEED") {
      const foodIndex = inventory.findIndex(i => i.id === "food");
      if (foodIndex >= 0) {
        setInventory(items => items.filter((_, idx) => idx !== foodIndex));
      } else if (wallet.starPieces >= 3) {
        addWalletTx("밥 주기", -3);
      } else {
        return { success: false, error: "별조각이나 밥 아이템이 부족해요." };
      }
      setCharacter(c => ({ ...c, fullness: Math.min(100, c.fullness + 30) }));
      return { success: true, message: `${character.name}가 든든해졌어요. 포만감 +30` };
    }

    if (actionType === "PLAY") {
      const toyIndex = inventory.findIndex(i => i.id === "toy");
      if (toyIndex >= 0) {
        setInventory(items => items.filter((_, idx) => idx !== toyIndex));
      } else if (wallet.starPieces >= 5) {
        addWalletTx("놀아주기", -5);
      } else {
        return { success: false, error: "별조각이나 장난감 아이템이 부족해요." };
      }
      setCharacter(c => ({ ...c, affection: Math.min(100, c.affection + 25) }));
      return { success: true, message: `${character.name}가 가까워졌어요. 애정 +25` };
    }
    return { success: false, error: "알 수 없는 돌봄 활동이에요." };
  };

  const purchaseItem = (item, tabName) => {
    if (wallet.starPieces < item.price) {
      return { success: false, error: `별조각이 ${item.price - wallet.starPieces}개 부족해요.` };
    }
    addWalletTx(`${item.name} 구매`, -item.price);
    setInventory(items => [...items, { ...item, type: tabName === "skin" ? "skin" : "consumable" }]);
    return { success: true, message: `${item.name}을(를) 보관함에 넣었어요.` };
  };

  const equipSkin = (skin) => {
    setCharacter(c => ({ ...c, skin }));
    showToast(skin ? "스킨을 장착했어요." : "기본 외형으로 돌아왔어요.");
  };

  const useInventoryItem = (itemId) => {
    if (itemId === "food") return useCareAction("FEED");
    if (itemId === "toy") return useCareAction("PLAY");
    return { success: false, error: "사용할 수 없는 아이템이에요." };
  };

  const claimShareReward = () => {
    if (shareRewardClaimedToday) {
      showToast("오늘 공유 보상은 이미 받았어요.");
      return;
    }
    setShareRewardClaimedToday(true);
    addWalletTx("SNS 공유 보상", 10);
    showToast("SNS 공유 보상으로 별조각 10개를 받았어요.");
  };

  const checkAttendance = () => {
    if (attendanceDates.includes(TODAY)) return;
    setAttendanceDates(d => [...d, TODAY]);
    setAttendanceStreak(s => s + 1);
    setCharacter(c => ({ ...c, affection: Math.min(100, c.affection + 3) }));
    showToast("오늘 출석 도장을 찍었어요. 애정 +3");
  };

  const markNotificationAsRead = (id) => {
    setNotifications(ns => ns.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const logout = () => {
    setFlow("login");
    setTab("home");
    setAppView("tabs");
  };

  const renderAppView = () => {
    if (appView === "missionAnswer") {
      return <MissionAnsweringScreen character={character} activeMission={pendingCompletedMission} onAnswerSubmit={submitMissionAnswer} onBack={() => setAppView("tabs")} />;
    }
    if (appView === "missionResult") {
      return <MissionResultScreen character={character} activeMission={pendingCompletedMission} earnedStarPieces={earnedStarPieces} totalStarPieces={wallet.starPieces} onGoHome={() => setAppView("tabs")} />;
    }
    if (appView === "characterDetail") {
      return <CharacterDetailScreen character={character} wallet={wallet} inventory={inventory} equippedSkin={character.skin} onUseCareAction={useCareAction} onBack={() => setAppView("tabs")} onShowToast={showToast} />;
    }
    if (appView === "shop") {
      return <ShopScreen wallet={wallet} onPurchaseItem={purchaseItem} onBack={() => setAppView("tabs")} onShowToast={showToast} onOpenInventory={() => setAppView("inventory")} />;
    }
    if (appView === "inventory") {
      return <InventoryScreen inventory={inventory} equippedSkin={character.skin} onEquipSkin={equipSkin} onUseItem={useInventoryItem} character={character} onBack={() => setAppView("shop")} onShowToast={showToast} />;
    }
    if (appView === "wallet") {
      return <WalletHistoryScreen wallet={wallet} onBack={() => setAppView("tabs")} />;
    }
    if (appView === "share") {
      return <ShareScreen character={character} equippedSkin={character.skin} onClaimShareReward={claimShareReward} onBack={() => setAppView("tabs")} onShowToast={showToast} />;
    }
    if (appView === "notifications") {
      return <NotificationBoxScreen notifications={notifications} onMarkAsRead={markNotificationAsRead} onBack={() => setAppView("tabs")} />;
    }
    if (appView === "attendance") {
      return <AttendanceCalendarScreen attendanceDates={attendanceDates} hasCheckedToday={attendanceDates.includes(TODAY)} onCheckAttendance={checkAttendance} onBack={() => setAppView("tabs")} />;
    }

    let content;
    if (tab === "home") {
      content = (
        <HomeScreen
          character={character}
          wallet={wallet}
          activeMission={activeMission}
          dailyMissionIndex={missionIndex}
          equippedSkin={character.skin}
          attendanceStreak={attendanceStreak}
          onCompleteClick={completeMissionStart}
          onRejectClick={rejectMission}
          onOpenNotifications={() => setAppView("notifications")}
          onOpenWalletHistory={() => setAppView("wallet")}
          onOpenAttendance={() => setAppView("attendance")}
          onOpenShare={() => setAppView("share")}
        />
      );
    } else if (tab === "missions") {
      content = <MissionHistoryScreen missionHistory={missionHistory} />;
    } else if (tab === "me") {
      content = <MyPageScreen user={user} character={character} wallet={wallet} attendanceStreak={attendanceStreak} onLogout={logout} />;
    }

    return (
      <>
        <div className="screen">{content}</div>
        <BottomTabs active={tab} onChange={(k) => {
          if (k === "character") { setAppView("characterDetail"); return; }
          if (k === "shop") { setAppView("shop"); return; }
          setAppView("tabs");
          setTab(k);
        }} />
      </>
    );
  };

  const renderInner = () => {
    if (flow === "login") return <LoginScreen onLogin={() => setFlow("charSelect")} />;
    if (flow === "charSelect") {
      return <CharacterSelectScreen onBack={() => setFlow("login")} onNext={(id) => { setSelectedCharacterType(id); setFlow("charName"); }} />;
    }
    if (flow === "charName") {
      return (
        <CharacterNameScreen
          character={selectedCharacterType}
          onBack={() => setFlow("charSelect")}
          onNext={(name) => {
            setCharacter({ type: selectedCharacterType, name, fullness: 80, energy: 55, affection: 35, skin: null });
            setFlow("onboarding");
          }}
        />
      );
    }
    if (flow === "onboarding") {
      return <OnboardingScreen character={character.type} name={character.name} onBack={() => setFlow("charName")} onDone={() => setFlow("app")} />;
    }
    return renderAppView();
  };

  return (
    <>
      <AppShell>
        {renderInner()}
        <div className="toast-container">
          {toasts.map(t => <div key={t.id} className="toast-message">{t.message}</div>)}
        </div>
      </AppShell>

      <TweaksPanel title="Tweaks">
        <TweakSection label="테마" />
        <TweakRadio label="컬러 테마" value={tweaks.theme} onChange={v => setTweak("theme", v)}
          options={[{ value: "latte", label: "Latte" }, { value: "mint", label: "Mint" }, { value: "cloud", label: "Cloud" }]} />
        <TweakRadio label="모드" value={tweaks.mode} onChange={v => setTweak("mode", v)}
          options={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }]} />
        <TweakRadio label="디스플레이 폰트" value={tweaks.fontDisplay} onChange={v => setTweak("fontDisplay", v)}
          options={[{ value: "suit", label: "SUIT" }, { value: "pretendard", label: "Pretendard" }]} />
        <TweakSection label="프로토타입 흐름" />
        <TweakButton label="로그인부터" onClick={() => setFlow("login")} />
        <TweakButton label="캐릭터 선택부터" onClick={() => setFlow("charSelect")} />
        <TweakButton label="이름 설정부터" onClick={() => setFlow("charName")} />
        <TweakButton label="홈으로 점프" onClick={() => { setFlow("app"); setTab("home"); setAppView("tabs"); }} />
        <TweakButton label="공유 카드 보기" onClick={() => { setFlow("app"); setAppView("share"); }} />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
