/* ============================================================
   Polaris — In-App Screens (Home, Q&A, Result, History, Care, Shop, Inventory, Wallet, Share, Notifications)
   ============================================================ */

/* ---------- 1. Home Screen (SCR-006) ---------- */
function HomeScreen({
  character,
  wallet,
  activeMission,
  dailyMissionIndex,
  onCompleteClick,
  onRejectClick,
  onOpenNotifications,
  onOpenWalletHistory,
  onOpenAttendance,
  onOpenShare,
  equippedSkin,
  attendanceStreak
}) {
  const charId = character.type || "nova";
  const charName = character.name || "별친구";
  const ext = ["nova", "jjori", "mumu"].includes(charId) ? "png" : "svg";
  
  // 상태 등급 계산
  const getStatStatus = (val) => {
    if (val >= 70) return { label: "든든함", color: "var(--success)" };
    if (val >= 30) return { label: "출출함", color: "var(--primary)" };
    return { label: "배고픔 (돌봄 필요)", color: "var(--danger)", bad: true };
  };

  const getEnergyStatus = (val) => {
    if (val >= 70) return { label: "말짱함", color: "var(--success)" };
    if (val >= 30) return { label: "졸림", color: "var(--primary)" };
    return { label: "피곤함 (돌봄 필요)", color: "var(--danger)", bad: true };
  };

  const getAffectionStatus = (val) => {
    if (val >= 70) return { label: "가까움", color: "var(--success)" };
    if (val >= 30) return { label: "조용함", color: "var(--primary)" };
    return { label: "쓸쓸함 (돌봄 필요)", color: "var(--danger)", bad: true };
  };

  const fStatus = getStatStatus(character.fullness);
  const eStatus = getEnergyStatus(character.energy);
  const aStatus = getAffectionStatus(character.affection);

  // BAD 상태가 하나라도 있으면 흔들림 애니메이션 및 알람 표시
  const isAnyBad = fStatus.bad || eStatus.bad || aStatus.bad;

  // 캐릭터 말풍선 멘트 결정 (상태에 따라 변화)
  const getSpeechBubble = () => {
    if (isAnyBad) {
      if (charId === "nova") return "으응... 조금 기운이 없는 것 같아...";
      if (charId === "mumu") return "무우... 💬 (기운이 없어 잎이 축 쳐졌습니다.)";
      return "어이, 주인장. 나 배고프거나 피곤하거든? 언넝 조치해라.";
    }
    if (charId === "nova") return "오늘도 빛이 조금씩 모이고 있어... 고마워.";
    if (charId === "mumu") return "무... ✦ (기분이 좋은지 잎이 반짝입니다.)";
    return "집 앞도 밖임. 원정 준비는 완벽함.";
  };

  return (
    <div className="screen-enter" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Header
        title="Polaris"
        left={<button className="icon-btn" onClick={onOpenWalletHistory} aria-label="지갑 내역"><Coin amount={wallet.starPieces} /></button>}
        right={
          <button className="icon-btn" onClick={onOpenNotifications} style={{ position: "relative" }} aria-label="알림">
            <Icon name="bell" size={22} />
            <span style={{ position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: "50%", background: "var(--danger)" }}></span>
          </button>
        }
      />

      <div className="screen-body" style={{ padding: "12px 20px 24px" }}>
        {/* 캐릭터 스테이지 */}
        <div className={`stage ${isAnyBad ? "shake-bad" : ""}`} style={{ padding: "20px 16px", borderRadius: 28 }}>
          {/* 장착된 스킨에 따른 외형 표시 테두리 또는 배지 */}
          {equippedSkin && (
            <div style={{ position: "absolute", top: 12, left: 16, background: "var(--primary-strong)", color: "white", fontSize: 10, fontWeight: "bold", padding: "4px 8px", borderRadius: 8, zIndex: 2 }}>
              ✨ {equippedSkin === "ribbon" ? "리본" : equippedSkin === "sunglasses" ? "선글라스" : "마법사 모자"} 장착중
            </div>
          )}

          <div className="character-img" style={{ width: 140, height: 140, position: "relative" }}>
            <img 
              src={`../../assets/character-${charId}.${ext}`} 
              alt={charId} 
              style={{ width: "100%", height: "100%", objectFit: "contain" }} 
            />
            {equippedSkin === "ribbon" && (
              <span style={{ position: "absolute", top: 10, right: 10, fontSize: 32 }}>🎀</span>
            )}
            {equippedSkin === "sunglasses" && (
              <span style={{ position: "absolute", top: 38, left: "27%", fontSize: 28 }}>🕶️</span>
            )}
            {equippedSkin === "wizard_hat" && (
              <span style={{ position: "absolute", top: -16, left: "23%", fontSize: 36 }}>🧙‍♂️</span>
            )}
          </div>
          <div className="stage-name">{charName}</div>
          <div className="stage-bubble" style={{ fontSize: 15, padding: "8px 12px", fontFamily: "var(--font-sans)", fontWeight: "600" }}>{getSpeechBubble()}</div>
          
          {/* 캐릭터 상태 수치 UI */}
          <div style={{ width: "100%", marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
            {/* 포만감 */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: "bold", color: "var(--fg-2)" }}>
                <span>🍚 포만감: {fStatus.label}</span>
                <span>{character.fullness}%</span>
              </div>
              <div style={{ background: "rgba(0,0,0,0.06)", height: 6, borderRadius: 99, marginTop: 2, overflow: "hidden" }}>
                <div style={{ width: `${character.fullness}%`, height: "100%", background: fStatus.color, borderRadius: 99 }} />
              </div>
            </div>
            {/* 기운 */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: "bold", color: "var(--fg-2)" }}>
                <span>💤 기운: {eStatus.label}</span>
                <span>{character.energy}%</span>
              </div>
              <div style={{ background: "rgba(0,0,0,0.06)", height: 6, borderRadius: 99, marginTop: 2, overflow: "hidden" }}>
                <div style={{ width: `${character.energy}%`, height: "100%", background: eStatus.color, borderRadius: 99 }} />
              </div>
            </div>
            {/* 애정 */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: "bold", color: "var(--fg-2)" }}>
                <span>❤️ 애정: {aStatus.label}</span>
                <span>{character.affection}%</span>
              </div>
              <div style={{ background: "rgba(0,0,0,0.06)", height: 6, borderRadius: 99, marginTop: 2, overflow: "hidden" }}>
                <div style={{ width: `${character.affection}%`, height: "100%", background: aStatus.color, borderRadius: 99 }} />
              </div>
            </div>
          </div>
        </div>

        {/* 출석 체크 요약 카드 */}
        <div className="card" onClick={onOpenAttendance} style={{ marginTop: 16, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", background: "linear-gradient(90deg, var(--bg-2) 0%, var(--primary-soft) 100%)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>📅</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: "bold", color: "var(--fg-1)" }}>연속 출석 {attendanceStreak}일차</div>
              <div style={{ fontSize: 11, color: "var(--fg-3)" }}>오늘의 출석 도장 콕 찍기</div>
            </div>
          </div>
          <span style={{ color: "var(--primary)", fontWeight: "bold", fontSize: 12 }}>달력 보기 &gt;</span>
        </div>

        <div className="card" onClick={onOpenShare} style={{ marginTop: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>✦</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: "bold", color: "var(--fg-1)" }}>오늘의 카드 공유</div>
              <div style={{ fontSize: 11, color: "var(--fg-3)" }}>한 줄 다짐을 담아 별조각 보상 받기</div>
            </div>
          </div>
          <span style={{ color: "var(--primary)", fontWeight: "bold", fontSize: 12 }}>공유하기 &gt;</span>
        </div>

        {/* 단일 추천 미션 카드 (SCR-007) */}
        <div className="section-title">
          <h2>제안된 미션</h2>
          <span style={{ fontSize: 12, color: "var(--fg-3)", fontWeight: "bold" }}>오늘 {dailyMissionIndex} / 15</span>
        </div>

        {activeMission ? (
          <div className="card" style={{ border: "2px solid var(--primary)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 6 }}>
                <span className="tag" style={{ background: "var(--primary-soft)", color: "var(--primary-strong)" }}>
                  {activeMission.category === "morning" ? "아침" : activeMission.category === "fitness" ? "운동" : activeMission.category === "reading" ? "독서" : "마음"}
                </span>
                <span className="tag" style={{ background: "var(--accent-soft)", color: "var(--neutral-800)" }}>
                  {activeMission.intensity === "LIGHT" ? "쉬움" : activeMission.intensity === "NORMAL" ? "보통" : "도전"}
                </span>
              </div>
              <div style={{ fontSize: 13, fontWeight: "bold", color: "var(--accent)", fontFamily: "var(--font-mono)" }}>
                ✦ {activeMission.reward} 별조각
              </div>
            </div>

            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--fg-1)", margin: "4px 0" }}>
                {activeMission.title}
              </h3>
              <p style={{ fontSize: 13, color: "var(--fg-3)", margin: 0 }}>
                ⏰ 예상 소요 시간: {activeMission.duration} · {activeMission.sub}
              </p>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button 
                className="btn btn-secondary" 
                onClick={onRejectClick}
                style={{ flex: 1, padding: "12px", borderRadius: 12, fontSize: 14 }}
              >
                다른 거 볼게요
              </button>
              <button 
                className="btn btn-primary" 
                onClick={onCompleteClick}
                style={{ flex: 1.5, padding: "12px", borderRadius: 12, fontSize: 14 }}
              >
                해냈어요! ✓
              </button>
            </div>
          </div>
        ) : (
          <div className="card" style={{ textAlign: "center", padding: "32px 16px" }}>
            <span style={{ fontSize: 40 }}>😴</span>
            <h3 style={{ fontSize: 16, fontWeight: "bold", marginTop: 12, color: "var(--fg-1)" }}>오늘 제안할 수 있는 미션이 끝났어요!</h3>
            <p style={{ fontSize: 13, color: "var(--fg-3)", marginTop: 4 }}>내일 새로운 미션으로 다시 찾아올게요.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- 2. Mission Answering / Review Screen (SCR-009) ---------- */
function MissionAnsweringScreen({ character, activeMission, onAnswerSubmit, onBack }) {
  const [answer, setAnswer] = React.useState("");
  const charId = character.type || "nova";
  const charName = character.name || "별친구";
  const ext = ["nova", "jjori", "mumu"].includes(charId) ? "png" : "svg";

  // 캐릭터별 Q&A 문구 결정
  const getAnsweringQuestion = () => {
    if (charId === "nova") return "방금 미션을 해내면서... 가장 기억에 남거나 느꼈던 점이 있어...? 들려줘...";
    if (charId === "mumu") return "무...? (방금 한 일에 대해서 아주 가볍게 느낌을 끄적여보라는 뜻 같습니다.)";
    return "원정 기록에 작성할 짧막한 후기 하나 줘 봐. 쪼리 기준 10자면 떡침.";
  };

  return (
    <div className="screen-enter" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Header title="미션 인증하기" onBack={onBack} />
      <div className="screen-body" style={{ display: "flex", flexDirection: "column", height: "calc(100% - 69px)", justifyContent: "space-between" }}>
        <div>
          {/* 캐릭터 기쁜 표정 에셋 및 질문 */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 16, marginBottom: 20 }}>
            <div style={{ width: 120, height: 120, position: "relative" }} className="character-img">
              {/* 해냈으므로 happy 에셋 사용 */}
              <img 
                src={`../../assets/character-${charId}-happy.${ext}`} 
                alt="happy" 
                style={{ width: "100%", height: "100%", objectFit: "contain" }} 
              />
            </div>
            <div className="stage-bubble" style={{ marginTop: 14, maxWidth: "90%", borderRadius: "18px 18px 18px 4px", fontSize: 14, fontFamily: "var(--font-sans)", lineHeight: 1.5 }}>
              {getAnsweringQuestion()}
            </div>
          </div>

          <div style={{ width: "100%" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: "bold", color: "var(--fg-2)", marginBottom: 8 }}>
              실천 후기 남기기 (선택)
            </div>
            <textarea
              style={{
                width: "100%",
                height: 120,
                padding: 14,
                borderRadius: 14,
                border: "1.5px solid var(--border-2)",
                background: "var(--bg-2)",
                color: "var(--fg-1)",
                fontFamily: "inherit",
                fontSize: 14,
                resize: "none",
                outline: "none"
              }}
              placeholder="예: 물 한 잔 마시니 입안이 개운해요!"
              value={answer}
              onChange={e => {
                if (e.target.value.length <= 200) setAnswer(e.target.value);
              }}
            />
            <div style={{ textAlign: "right", fontSize: 12, color: "var(--fg-4)", marginTop: 4 }}>
              {answer.length} / 200 자
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
          <Button 
            onClick={() => onAnswerSubmit(answer)} 
            disabled={!answer.trim() || answer.length > 200}
          >
            답변 완료
          </Button>
          <button 
            onClick={() => onAnswerSubmit("")} 
            style={{ border: "0", background: "none", color: "var(--fg-3)", fontSize: 13, textDecoration: "underline", cursor: "pointer", alignSelf: "center" }}
          >
            질문에 답변하지 않고 건너뛰기
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- 3. Mission Result Screen (SCR-010) ---------- */
function MissionResultScreen({ character, activeMission, earnedStarPieces, totalStarPieces, onGoHome }) {
  const charId = character.type || "nova";
  const charName = character.name || "별친구";
  const ext = ["nova", "jjori", "mumu"].includes(charId) ? "png" : "svg";

  // 별가루 파티클 랜덤 좌표 생성
  const sparkles = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 180 + "px",
    y: (Math.random() - 0.7) * 160 - 40 + "px",
    emoji: ["✨", "✦", "⭐", "🎉"][i % 4],
    delay: (i * 0.08) + "s"
  }));

  // 캐릭터 반응 대사
  const getReactionMessage = () => {
    if (charId === "nova") return "정말 대단해... 오늘 너 덕분에 밤하늘이 조금 더 반짝이는 것 같아.";
    if (charId === "mumu") return "무! (무무가 나뭇잎을 춤추듯 파르르 흔들며 보상을 기념합니다.)";
    return "해냈네? 쪼리 원정 일지에 영광스러운 한 페이지로 박제 완료함.";
  };

  return (
    <div className="screen-enter" style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between", padding: "32px 24px" }}>
      {/* 파티클 컨테이너 */}
      <div style={{ position: "relative", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", marginTop: 40 }}>
        {sparkles.map(sp => (
          <span 
            key={sp.id} 
            className="sparkle-particle"
            style={{ 
              "--x": sp.x, 
              "--y": sp.y,
              animationDelay: sp.delay 
            }}
          >
            {sp.emoji}
          </span>
        ))}

        <div style={{ width: 140, height: 140, position: "relative" }} className="character-img">
          <img 
            src={`../../assets/character-${charId}-happy.${ext}`} 
            alt="happy" 
            style={{ width: "100%", height: "100%", objectFit: "contain" }} 
          />
        </div>

        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, color: "var(--fg-1)", marginTop: 24, textAlign: "center" }}>
          미션 달성 완료!
        </h1>
        
        <p style={{ fontSize: 14, color: "var(--fg-3)", marginTop: 6, textAlign: "center" }}>
          꾸준한 실천이 별친구의 성장을 돕습니다.
        </p>

        {/* 보상 카드 */}
        <div className="card" style={{ width: "100%", marginTop: 20, textAlign: "center", background: "var(--accent-soft)", borderColor: "transparent" }}>
          <div style={{ fontSize: 13, fontWeight: "bold", color: "var(--fg-2)" }}>보상 내역</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--neutral-800)", marginTop: 6, fontFamily: "var(--font-mono)" }}>
            ✦ +{earnedStarPieces} 별조각
          </div>
          <div style={{ fontSize: 12, color: "var(--success)", fontWeight: "bold", marginTop: 4 }}>
            ❤️ {charName}의 애정 수치 +5 증가
          </div>
        </div>

        <div className="stage-bubble" style={{ marginTop: 20, maxWidth: "100%", borderRadius: "18px 18px 18px 4px", fontSize: 14, fontFamily: "var(--font-sans)", lineHeight: 1.5, textAlign: "center" }}>
          {getReactionMessage()}
        </div>

        <div style={{ marginTop: 20, fontSize: 13, color: "var(--fg-3)" }}>
          보유 별조각: <span style={{ fontWeight: "bold", color: "var(--fg-1)", fontFamily: "var(--font-mono)" }}>✦ {totalStarPieces}</span>
        </div>
      </div>

      <div style={{ width: "100%" }}>
        <Button onClick={onGoHome}>홈 화면으로 돌아가기</Button>
      </div>
    </div>
  );
}

/* ---------- 4. Mission History Screen (SCR-011) ---------- */
function MissionHistoryScreen({ missionHistory }) {
  return (
    <div className="screen-enter" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Header title="오늘의 미션 스택" />
      <div className="screen-body" style={{ padding: "12px 20px 24px" }}>
        <div style={{ fontSize: 13, color: "var(--fg-3)", marginBottom: 16 }}>
          오늘 제안받고 진행한 미션들의 기록입니다 (최대 15개 제한)
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {missionHistory.map((item, idx) => (
            <div 
              key={idx} 
              className="card" 
              style={{ 
                borderLeft: item.status === "COMPLETED" ? "4px solid var(--success)" 
                            : item.status === "REJECTED" ? "4px solid var(--fg-4)" 
                            : "4px solid var(--primary)",
                padding: "14px 16px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="tag" style={{ 
                  background: item.status === "COMPLETED" ? "var(--success-soft)" 
                              : item.status === "REJECTED" ? "var(--bg-3)" 
                              : "var(--primary-soft)",
                  color: item.status === "COMPLETED" ? "var(--success-strong)" 
                         : item.status === "REJECTED" ? "var(--fg-3)" 
                         : "var(--primary-strong)"
                }}>
                  {item.status === "COMPLETED" ? "완료됨" : item.status === "REJECTED" ? "거절함" : "진행중"}
                </span>
                <span style={{ fontSize: 11, color: "var(--fg-4)", fontFamily: "var(--font-mono)" }}>
                  {item.timestamp}
                </span>
              </div>

              <h4 style={{ margin: "8px 0 4px", fontSize: 15, fontWeight: "bold", color: "var(--fg-1)" }}>
                {item.title}
              </h4>

              {item.status === "COMPLETED" && (
                <div style={{ marginTop: 8, padding: "8px 10px", background: "var(--bg-3)", borderRadius: 8, fontSize: 12, color: "var(--fg-2)" }}>
                  💬 <strong>답변:</strong> {item.answer || "(건너뜀)"}
                  <div style={{ color: "var(--accent)", fontWeight: "bold", marginTop: 4, fontFamily: "var(--font-mono)" }}>✦ +10 별조각 획득</div>
                </div>
              )}
              {item.status === "REJECTED" && (
                <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 4 }}>
                  이 미션은 거절하고 다음 제안으로 넘어갔습니다.
                </div>
              )}
            </div>
          ))}

          {missionHistory.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <span style={{ fontSize: 32 }}>📁</span>
              <p style={{ color: "var(--fg-3)", fontSize: 13, marginTop: 8 }}>오늘 제안받은 미션 기록이 존재하지 않아요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- 5. Character Detail & Care (SCR-012) ---------- */
function CharacterDetailScreen({ character, wallet, inventory, equippedSkin, onUseCareAction, onBack, onShowToast }) {
  const charId = character.type || "nova";
  const charName = character.name || "별친구";
  const ext = ["nova", "jjori", "mumu"].includes(charId) ? "png" : "svg";

  // 보유 소모품 카운트 구하기
  const foodCount = inventory.filter(i => i.id === "food").length;
  const toyCount = inventory.filter(i => i.id === "toy").length;

  const handleCare = (actionType) => {
    let result = onUseCareAction(actionType);
    if (!result.success) {
      onShowToast(result.error);
    } else {
      onShowToast(result.message);
    }
  };

  return (
    <div className="screen-enter" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Header title="상태 상세 및 돌봄" onBack={onBack} />
      <div className="screen-body" style={{ padding: "12px 20px 24px" }}>
        {/* 캐릭터 렌더링 */}
        <div className="stage" style={{ padding: "24px 16px", borderRadius: 28 }}>
          <div className="character-img" style={{ width: 150, height: 150, position: "relative" }}>
            <img 
              src={`../../assets/character-${charId}.${ext}`} 
              alt={charId} 
              style={{ width: "100%", height: "100%", objectFit: "contain" }} 
            />
            {equippedSkin === "ribbon" && (
              <span style={{ position: "absolute", top: 10, right: 10, fontSize: 32 }}>🎀</span>
            )}
            {equippedSkin === "sunglasses" && (
              <span style={{ position: "absolute", top: 42, left: "27%", fontSize: 28 }}>🕶️</span>
            )}
            {equippedSkin === "wizard_hat" && (
              <span style={{ position: "absolute", top: -16, left: "23%", fontSize: 36 }}>🧙‍♂️</span>
            )}
          </div>
          <div className="stage-name">{charName}</div>
          {equippedSkin && (
            <div style={{ fontSize: 11, color: "var(--primary)", fontWeight: 800 }}>
              {equippedSkin === "ribbon" ? "러블리 리본" : equippedSkin === "sunglasses" ? "까리한 선글라스" : "마법사 꼬깔모자"} 착용중
            </div>
          )}
          <div style={{ fontSize: 12, color: "var(--fg-3)" }}>Lv.1 별친구</div>
        </div>

        {/* 상태 세부 요약 */}
        <div className="card" style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: "bold", color: "var(--fg-1)" }}>
              <span>🍚 포만감</span>
              <span>{character.fullness} / 100</span>
            </div>
            <div style={{ background: "rgba(0,0,0,0.06)", height: 8, borderRadius: 99, marginTop: 4, overflow: "hidden" }}>
              <div style={{ width: `${character.fullness}%`, height: "100%", background: "var(--success)", borderRadius: 99 }} />
            </div>
            <div style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 2 }}>
              6시간마다 10씩 자동 감소해요. (0이 되면 배고픔 상태가 됩니다)
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--border-1)", paddingTop: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: "bold", color: "var(--fg-1)" }}>
              <span>💤 기운</span>
              <span>{character.energy} / 100</span>
            </div>
            <div style={{ background: "rgba(0,0,0,0.06)", height: 8, borderRadius: 99, marginTop: 4, overflow: "hidden" }}>
              <div style={{ width: `${character.energy}%`, height: "100%", background: "var(--primary)", borderRadius: 99 }} />
            </div>
            <div style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 2 }}>
              8시간마다 10씩 자동 감소해요. (0이 되면 피곤해집니다)
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--border-1)", paddingTop: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: "bold", color: "var(--fg-1)" }}>
              <span>❤️ 애정</span>
              <span>{character.affection} / 100</span>
            </div>
            <div style={{ background: "rgba(0,0,0,0.06)", height: 8, borderRadius: 99, marginTop: 4, overflow: "hidden" }}>
              <div style={{ width: `${character.affection}%`, height: "100%", background: "var(--danger)", borderRadius: 99 }} />
            </div>
            <div style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 2 }}>
              24시간 동안 아무 활동이 없으면 10씩 감소해요. 미션 완료 시 5씩 증가해요.
            </div>
          </div>
        </div>

        {/* 돌봄 액션 그리드 */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "var(--fg-1)", marginBottom: 10 }}>
            돌봄 활동 선택
          </div>
          <div className="care-grid">
            <button className="care-btn" onClick={() => handleCare("FEED")}>
              <span className="emoji">🍛</span>
              <span className="label">밥 주기</span>
              <span className="cost">✦ 3 or 인벤토리({foodCount})</span>
            </button>
            <button className="care-btn" onClick={() => handleCare("SLEEP")}>
              <span className="emoji">🛌</span>
              <span className="label">재우기</span>
              <span className="cost" style={{ color: "var(--success)" }}>무료</span>
            </button>
            <button className="care-btn" onClick={() => handleCare("PLAY")}>
              <span className="emoji">🧸</span>
              <span className="label">놀아주기</span>
              <span className="cost">✦ 5 or 인벤토리({toyCount})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- 6. Shop (SCR-013) ---------- */
function ShopScreen({ wallet, onPurchaseItem, onBack, onShowToast, onOpenInventory }) {
  const [tab, setTab] = React.useState("skin");
  const [selectedItem, setSelectedItem] = React.useState(null);

  // 상점 아이템 명세
  const skins = [
    { id: "ribbon", name: "러블리 핑크 리본", price: 80, emoji: "🎀", desc: "캐릭터 오른쪽 귀에 예쁘게 매달리는 분홍색 리본 스킨입니다." },
    { id: "sunglasses", name: "까리한 선글라스", price: 120, emoji: "🕶️", desc: "힙스터 감성을 뽐내는 까만 보잉 선글라스 스킨입니다." },
    { id: "wizard_hat", name: "마법사 꼬깔모자", price: 200, emoji: "🧙‍♂️", desc: "신비한 마법가루 효과가 돋보이는 마법사 파란 고깔모자 스킨입니다." }
  ];

  const consumables = [
    { id: "food", name: "영양 만점 든든한 밥", price: 10, emoji: "🍛", desc: "인벤토리에 저장해 두고 필요할 때 별친구의 포만감을 30 올려줄 수 있습니다." },
    { id: "toy", name: "푹신푹신 장난감 쥐", price: 15, emoji: "🧸", desc: "인벤토리에 저장해 두고 필요할 때 별친구의 애정도를 25 올려줄 수 있습니다." }
  ];

  const currentList = tab === "skin" ? skins : consumables;

  const handlePurchaseClick = (it) => {
    setSelectedItem(it);
  };

  const handleConfirmPurchase = () => {
    if (!selectedItem) return;
    const res = onPurchaseItem(selectedItem, tab);
    setSelectedItem(null);
    if (res.success) {
      onShowToast(res.message);
    } else {
      onShowToast(res.error);
    }
  };

  return (
    <div className="screen-enter" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Header
        title="상점"
        onBack={onBack}
        right={
          <button className="icon-btn" onClick={onOpenInventory} aria-label="보관함 열기" style={{ width: "auto", padding: "0 10px", gap: 6 }}>
            <Icon name="shop" size={18} />
            <span style={{ fontSize: 12, fontWeight: 800 }}>보관함</span>
          </button>
        }
      />

      <div className="screen-body" style={{ padding: "12px 20px 24px" }}>
        <div className="card" style={{ marginBottom: 16, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: "var(--fg-2)" }}>보유 별조각</span>
          <Coin amount={wallet.starPieces} />
        </div>

        {/* 탭 네비게이션 */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button 
            className={`chip ${tab === "skin" ? "selected" : ""}`}
            onClick={() => setTab("skin")}
            style={{ flex: 1, textAlign: "center" }}
          >
            스킨 꾸미기
          </button>
          <button 
            className={`chip ${tab === "consumable" ? "selected" : ""}`}
            onClick={() => setTab("consumable")}
            style={{ flex: 1, textAlign: "center" }}
          >
            소모품 아이템
          </button>
        </div>

        {/* 아이템 그리드 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {currentList.map(it => {
            const cant = wallet.starPieces < it.price;
            return (
              <div 
                key={it.id} 
                className="item-card"
                onClick={() => handlePurchaseClick(it)}
                style={{ padding: "16px 12px", background: "var(--bg-2)" }}
              >
                <div style={{ fontSize: 36, margin: "8px 0" }}>{it.emoji}</div>
                <div className="name" style={{ fontSize: 13, fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
                  {it.name}
                </div>
                <div className={`price ${cant ? "cant" : ""}`} style={{ fontSize: 12, fontWeight: "bold", fontFamily: "var(--font-mono)" }}>
                  ✦ {it.price}
                </div>
              </div>
            );
          })}
        </div>

        {/* 안내 */}
        <div style={{ marginTop: 24, padding: 12, background: "var(--bg-2)", border: "1px solid var(--border-1)", borderRadius: 14 }}>
          <div style={{ fontSize: 12, color: "var(--fg-3)", lineHeight: 1.5 }}>
            💡 별조각은 오늘의 추천 미션을 완수하고 Q&A 회고 일기를 텍스트로 가볍게 작성하면 얻을 수 있습니다.
          </div>
        </div>
      </div>

      {/* 구매 확인 팝업 모달 */}
      {selectedItem && (
        <Modal
          isOpen={true}
          title="아이템 구매"
          confirmText="구매하기"
          cancelText="취소"
          onConfirm={handleConfirmPurchase}
          onCancel={() => setSelectedItem(null)}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: 40, marginBottom: 8 }}>{selectedItem.emoji}</span>
            <strong>{selectedItem.name}</strong>
            <p style={{ fontSize: 12, color: "var(--fg-3)", margin: "8px 0 16px" }}>{selectedItem.desc}</p>
            {wallet.starPieces >= selectedItem.price ? (
              <div style={{ background: "var(--bg-3)", padding: "10px 16px", borderRadius: 12, width: "100%", fontSize: 13 }}>
                보유 별조각: ✦ {wallet.starPieces}
                <br />
                구매 후 잔액: <strong style={{ color: "var(--primary)" }}>✦ {wallet.starPieces - selectedItem.price}</strong>
              </div>
            ) : (
              <div style={{ color: "var(--danger)", fontSize: 13, fontWeight: "bold" }}>
                별조각이 부족합니다! (부족분: {selectedItem.price - wallet.starPieces}✦)
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------- 7. Inventory Screen (SCR-014) ---------- */
function InventoryScreen({ inventory, equippedSkin, onEquipSkin, onUseItem, character, onBack, onShowToast }) {
  const [tab, setTab] = React.useState("skin");

  // 스킨 목록 필터
  const ownedSkins = inventory.filter(i => i.type === "skin");
  // 소모품 목록 필터
  const ownedConsumables = inventory.filter(i => i.type === "consumable");

  // 중복 카운트 구하기
  const getConsumableCount = (itemId) => {
    return ownedConsumables.filter(c => c.id === itemId).length;
  };

  const uniqueConsumables = [];
  ownedConsumables.forEach(c => {
    if (!uniqueConsumables.some(u => u.id === c.id)) {
      uniqueConsumables.push(c);
    }
  });

  const handleUseConsumable = (itemId) => {
    const res = onUseItem(itemId);
    if (res.success) {
      onShowToast(res.message);
    } else {
      onShowToast(res.error);
    }
  };

  return (
    <div className="screen-enter" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Header title="내 보관함" onBack={onBack} />
      <div className="screen-body" style={{ padding: "12px 20px 24px" }}>
        {/* 탭 네비게이션 */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button 
            className={`chip ${tab === "skin" ? "selected" : ""}`}
            onClick={() => setTab("skin")}
            style={{ flex: 1, textAlign: "center" }}
          >
            장착 중인 스킨
          </button>
          <button 
            className={`chip ${tab === "consumable" ? "selected" : ""}`}
            onClick={() => setTab("consumable")}
            style={{ flex: 1, textAlign: "center" }}
          >
            소모품 가방
          </button>
        </div>

        {tab === "skin" ? (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {/* 스킨 없음 기본 */}
              <div 
                className={`item-card ${!equippedSkin ? "equipped" : ""}`}
                onClick={() => onEquipSkin(null)}
                style={{ padding: "14px 10px", background: "var(--bg-2)", cursor: "pointer" }}
              >
                <div style={{ fontSize: 32, margin: "8px 0" }}>❌</div>
                <div style={{ fontSize: 13, fontWeight: "bold" }}>스킨 해제</div>
                <div style={{ fontSize: 11, color: "var(--fg-3)" }}>기본 외형</div>
              </div>

              {ownedSkins.map(sk => (
                <div 
                  key={sk.id}
                  className={`item-card ${equippedSkin === sk.id ? "equipped" : ""}`}
                  onClick={() => onEquipSkin(sk.id)}
                  style={{ padding: "14px 10px", background: "var(--bg-2)", cursor: "pointer" }}
                >
                  <div style={{ fontSize: 32, margin: "8px 0" }}>
                    {sk.id === "ribbon" ? "🎀" : sk.id === "sunglasses" ? "🕶️" : "🧙‍♂️"}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: "bold" }}>
                    {sk.id === "ribbon" ? "러블리 리본" : sk.id === "sunglasses" ? "까리한 선글라스" : "마법사 꼬깔모자"}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--primary)" }}>
                    {equippedSkin === sk.id ? "착용중" : "선택하여 장착"}
                  </div>
                </div>
              ))}
            </div>

            {ownedSkins.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <span style={{ fontSize: 32 }}>🛍️</span>
                <p style={{ color: "var(--fg-3)", fontSize: 13, marginTop: 8 }}>
                  소장한 스킨이 없어요.<br />상점에서 예쁜 스킨을 모아보세요!
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {uniqueConsumables.map(c => {
                const count = getConsumableCount(c.id);
                return (
                  <div key={c.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 32 }}>{c.id === "food" ? "🍛" : "🧸"}</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: "bold", color: "var(--fg-1)" }}>
                          {c.id === "food" ? "영양 만점 든든한 밥" : "푹신푹신 장난감 쥐"}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--fg-3)" }}>
                          {c.id === "food" ? "포만감 +30 증가" : "애정도 +25 증가"} · 보유 개수: <strong>{count}개</strong>
                        </div>
                      </div>
                    </div>
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleUseConsumable(c.id)}
                      style={{ width: "auto", padding: "8px 14px", borderRadius: 10, fontSize: 12 }}
                    >
                      사용하기
                    </button>
                  </div>
                );
              })}
            </div>

            {uniqueConsumables.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <span style={{ fontSize: 32 }}>🎒</span>
                <p style={{ color: "var(--fg-3)", fontSize: 13, marginTop: 8 }}>
                  가방에 보관된 소모품이 없어요.<br />상점에서 밥이나 장난감을 구매할 수 있습니다.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- 8. Wallet History Screen (SCR-015) ---------- */
function WalletHistoryScreen({ wallet, onBack }) {
  return (
    <div className="screen-enter" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Header title="별조각 ✦ 지갑 내역" onBack={onBack} />
      <div className="screen-body" style={{ padding: "12px 20px 24px" }}>
        {/* 잔액 요약 */}
        <div className="card" style={{ textAlign: "center", padding: "24px 16px", background: "var(--accent-soft)", borderColor: "transparent", marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: "bold", color: "var(--fg-2)" }}>현재 보유 별조각</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "var(--neutral-800)", marginTop: 6, fontFamily: "var(--font-mono)" }}>
            ✦ {wallet.starPieces}
          </div>
        </div>

        <SectionTitle>거래 상세 기록</SectionTitle>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {wallet.history.map((tx, idx) => (
            <div key={idx} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: "bold", color: "var(--fg-1)" }}>{tx.type}</div>
                <div style={{ fontSize: 11, color: "var(--fg-4)", marginTop: 2, fontFamily: "var(--font-mono)" }}>{tx.timestamp}</div>
              </div>
              <div style={{ 
                fontSize: 16, 
                fontWeight: "bold", 
                fontFamily: "var(--font-mono)",
                color: tx.amount > 0 ? "var(--success)" : "var(--danger)" 
              }}>
                {tx.amount > 0 ? `+${tx.amount}` : tx.amount}✦
              </div>
            </div>
          ))}

          {wallet.history.length === 0 && (
            <div style={{ textAlign: "center", padding: "30px 0" }}>
              <span style={{ fontSize: 24 }}>💸</span>
              <p style={{ color: "var(--fg-3)", fontSize: 12, marginTop: 6 }}>거래 내역이 아직 없어요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- 9. Share Screen (SCR-016) ---------- */
function ShareScreen({ character, equippedSkin, onClaimShareReward, onBack, onShowToast }) {
  const [slogan, setSlogan] = React.useState("오늘도 조금 반짝였음.");
  const charId = character.type || "nova";
  const charName = character.name || "별친구";
  const ext = ["nova", "jjori", "mumu"].includes(charId) ? "png" : "svg";

  const handleShareClick = () => {
    onShowToast("🔗 캐릭터 카드가 클립보드에 공유되었습니다!");
    // 일일 공유 보상 신청
    onClaimShareReward();
  };

  const handleSaveImage = () => {
    onShowToast("💾 캐릭터 카드가 갤러리에 저장되었습니다!");
  };

  return (
    <div className="screen-enter" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Header title="SNS 카드 공유" onBack={onBack} />
      <div className="screen-body" style={{ padding: "12px 20px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "calc(100% - 69px)" }}>
        <div>
          {/* 카드 프리뷰 컨테이너 */}
          <div 
            className="card" 
            style={{ 
              background: "linear-gradient(135deg, var(--bg-character) 0%, var(--bg-2) 100%)", 
              border: "2px solid var(--primary)",
              padding: "24px 20px", 
              borderRadius: 24, 
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
              overflow: "hidden",
              textAlign: "center",
              boxShadow: "0 12px 24px rgba(0,0,0,0.1)"
            }}
          >
            {/* 장식 */}
            <div style={{ position: "absolute", top: 12, left: 16, fontSize: 11, fontWeight: "bold", color: "var(--primary-strong)" }}>
              ✦ POLARIS ROUTINE
            </div>
            
            <div className="character-img" style={{ width: 140, height: 140, marginTop: 14, position: "relative" }}>
              <img 
                src={`../../assets/character-${charId}.${ext}`} 
                alt={charId} 
                style={{ width: "100%", height: "100%", objectFit: "contain" }} 
              />
              {equippedSkin === "ribbon" && (
                <span style={{ position: "absolute", top: 10, right: 10, fontSize: 32 }}>🎀</span>
              )}
              {equippedSkin === "sunglasses" && (
                <span style={{ position: "absolute", top: 38, left: "27%", fontSize: 28 }}>🕶️</span>
              )}
              {equippedSkin === "wizard_hat" && (
                <span style={{ position: "absolute", top: -16, left: "23%", fontSize: 36 }}>🧙‍♂️</span>
              )}
            </div>

            <h3 style={{ margin: "10px 0 2px", fontWeight: 800, fontSize: 18, color: "var(--fg-1)" }}>
              {charName}
            </h3>
            <div style={{ fontSize: 11, color: "var(--fg-3)", marginBottom: 14 }}>
              포만감 {character.fullness}% · 기운 {character.energy}% · 애정 {character.affection}%
            </div>

            {/* 다짐 문구 프리뷰 */}
            <div style={{ background: "rgba(255,255,255,0.75)", padding: "10px 16px", borderRadius: 14, minWidth: 200, fontSize: 14, fontWeight: "bold", color: "var(--neutral-800)", border: "1px dashed var(--border-2)" }}>
              "{slogan}"
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <TextField
              label="다짐 메시지 문구 작성 (최대 100자)"
              type="text"
              placeholder="예: 오늘도 조금 반짝였음."
              value={slogan}
              onChange={e => {
                if (e.target.value.length <= 100) setSlogan(e.target.value);
              }}
              hint={`${slogan.length}/100 자`}
            />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
          <Button onClick={handleShareClick}>
            📲 SNS로 공유하기 (+10✦)
          </Button>
          <Button variant="secondary" onClick={handleSaveImage}>
            💾 이미지 기기에 저장
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- 10. Notification Box Screen (SCR-020) ---------- */
function NotificationBoxScreen({ notifications, onMarkAsRead, onBack }) {
  return (
    <div className="screen-enter" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Header title="알림함" onBack={onBack} />
      <div className="screen-body" style={{ padding: "0" }}>
        {notifications.map(notif => (
          <div 
            key={notif.id} 
            className={`notif-item ${notif.unread ? "unread" : ""}`}
            onClick={() => onMarkAsRead(notif.id)}
          >
            <div className="notif-badge">
              {notif.type === "ALERT" ? "🚨" : notif.type === "MISSION" ? "✦" : "📅"}
            </div>
            <div className="notif-body">
              <div className="notif-title">{notif.title}</div>
              <div className="notif-text" style={{ fontSize: 13, color: notif.unread ? "var(--fg-1)" : "var(--fg-3)" }}>
                {notif.text}
              </div>
              <div className="notif-time">{notif.timestamp}</div>
            </div>
            {notif.unread && (
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary)", alignSelf: "center", marginRight: 8 }} />
            )}
          </div>
        ))}

        {notifications.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <span style={{ fontSize: 36 }}>🔔</span>
            <p style={{ color: "var(--fg-3)", fontSize: 13, marginTop: 10 }}>수신된 알림이 존재하지 않습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- 11. Attendance Stamp Calendar ---------- */
function AttendanceCalendarScreen({ attendanceDates, onCheckAttendance, hasCheckedToday, onBack }) {
  // 달력용 날짜 목록 빌드
  const daysInMonth = Array.from({ length: 28 }).map((_, i) => {
    const dayNum = i + 1;
    const dateStr = `2026-05-${dayNum < 10 ? "0" + dayNum : dayNum}`;
    const isStamped = attendanceDates.includes(dateStr);
    const isToday = dayNum === 20; // 2026년 5월 20일 기준 모킹
    return {
      dayNum,
      dateStr,
      isStamped,
      isToday
    };
  });

  return (
    <div className="screen-enter" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Header title="출석 체크 달력" onBack={onBack} />
      <div className="screen-body" style={{ padding: "12px 20px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "calc(100% - 69px)" }}>
        <div>
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--fg-1)", margin: "8px 0" }}>5월의 출석 현황</h2>
            <p style={{ fontSize: 12, color: "var(--fg-3)" }}>매일 첫 접속 시 출석 도장을 찍고 애정도를 올려보세요!</p>
          </div>

          {/* 달력 그리드 */}
          <div className="calendar-grid">
            {daysInMonth.map(day => (
              <div 
                key={day.dayNum} 
                className={`calendar-day ${day.isStamped ? "stamped" : ""} ${day.isToday ? "today" : ""}`}
              >
                {day.dayNum}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <Button 
            onClick={onCheckAttendance} 
            disabled={hasCheckedToday}
          >
            {hasCheckedToday ? "오늘 출석 도장을 이미 찍었어요 ✓" : "오늘 출석 도장 콕 찍기 (+3 애정)"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- 12. MyPage / Profile Settings (SCR-021) ---------- */
function MyPageScreen({ user, character, wallet, attendanceStreak, onLogout }) {
  const [notifyOn, setNotifyOn] = React.useState(true);
  const [dndOn, setDndOn] = React.useState(false);

  const totalCompleted = wallet.history.filter(h => h.type.includes("미션 완료")).length;

  return (
    <div className="screen-enter" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Header title="마이페이지" />
      <div className="screen-body" style={{ padding: "12px 20px 32px" }}>
        
        {/* 프로필 카드 */}
        <div className="card" style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--primary-soft)", display: "grid", placeItems: "center", fontSize: 24 }}>
            🌟
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--fg-1)", fontFamily: "var(--font-display)" }}>
              {user.nickname}
            </div>
            <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>
              {user.email.replace(/(.{3})(.*)(@.*)/, "$1***$3")}
            </div>
          </div>
        </div>

        {/* 대시보드 스탯 */}
        <div className="card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, textAlign: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--primary)", fontFamily: "var(--font-mono)" }}>
              {attendanceStreak}일
            </div>
            <div style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 4 }}>연속 출석</div>
          </div>
          <div style={{ borderLeft: "1px solid var(--border-1)", borderRight: "1px solid var(--border-1)" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--accent)", fontFamily: "var(--font-mono)" }}>
              {totalCompleted}개
            </div>
            <div style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 4 }}>미션 수행</div>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--success)", fontFamily: "var(--font-mono)" }}>
              {wallet.starPieces}✦
            </div>
            <div style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 4 }}>보유 별조각</div>
          </div>
        </div>

        {/* 설정 목록 */}
        <SectionTitle>앱 알림 설정</SectionTitle>
        <div className="card" style={{ padding: 0 }}>
          <div className="switch-row">
            <div>
              <div className="switch-label">푸시 알림 켜기</div>
              <div className="switch-sub">미션 추천 및 돌봄 리마인더 알림을 수신합니다.</div>
            </div>
            <label className="switch-toggle">
              <input type="checkbox" checked={notifyOn} onChange={() => setNotifyOn(!notifyOn)} />
              <span className="switch-slider"></span>
            </label>
          </div>

          <div className="switch-row">
            <div>
              <div className="switch-label">야간 방해 금지 모드</div>
              <div className="switch-sub">22:00 ~ 07:00 사이에는 푸시 알림을 수신하지 않습니다.</div>
            </div>
            <label className="switch-toggle">
              <input type="checkbox" checked={dndOn} onChange={() => setDndOn(!dndOn)} />
              <span className="switch-slider"></span>
            </label>
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <Button variant="secondary" onClick={onLogout} style={{ border: "1px solid var(--danger)", color: "var(--danger)" }}>
            로그아웃
          </Button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  HomeScreen,
  MissionAnsweringScreen,
  MissionResultScreen,
  MissionHistoryScreen,
  CharacterDetailScreen,
  ShopScreen,
  InventoryScreen,
  WalletHistoryScreen,
  ShareScreen,
  NotificationBoxScreen,
  AttendanceCalendarScreen,
  MyPageScreen
});
