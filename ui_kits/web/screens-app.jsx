/* ============================================================
   Polaris — In-App Screens (Home, Missions, Character, Shop)
   ============================================================ */

/* ---------- 4. Home ---------- */
function HomeScreen({ character, onOpenMissions, onOpenCharacter, missions, onToggleMission }) {
  const todayMissions = missions.slice(0, 3);
  const doneCount = missions.filter(m => m.done).length;
  const progress = Math.round((doneCount / missions.length) * 100);

  const bubbles = [
    "오늘은 어떤 미션을 함께할까요?",
    "물 한 잔, 잊지 않으셨죠?",
    "저랑 잠깐 산책할까요?",
  ];
  const bubble = bubbles[new Date().getDate() % bubbles.length];

  return (
    <div className="screen-enter">
      <Header
        title="Polaris"
        left={<button className="icon-btn" aria-label="설정"><Icon name="settings" size={22} /></button>}
        right={<button className="icon-btn" aria-label="알림"><Icon name="bell" size={22} /></button>}
      />
      <div className="screen-body" style={{ paddingTop: 12 }}>
        <div onClick={onOpenCharacter} style={{ cursor: "pointer" }}>
          <CharacterStage
            character={character}
            name="별이"
            level={3}
            bubble={bubble}
            hearts={78}
            coins={240}
            streak={7}
          />
        </div>

        {/* progress + streak */}
        <div className="card" style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <ProgressRing value={progress} num={`${doneCount}/${missions.length}`} label="오늘" size={92} stroke={8}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--fg-2)", marginBottom: 8 }}>
              이번 주
            </div>
            <StreakTrack doneCount={4} todayIndex={4} />
          </div>
        </div>

        <SectionTitle action="전체 보기" onAction={onOpenMissions}>오늘의 미션</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {todayMissions.map(m => (
            <MissionCard key={m.id} mission={m} onToggle={onToggleMission} />
          ))}
        </div>

        {/* AI suggestion card */}
        <div className="card" style={{ marginTop: 20, background: "var(--primary-soft)", borderColor: "transparent" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: "var(--primary)", color: "white", display: "grid", placeItems: "center", fontWeight: 800 }}>
              ✦
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--primary-strong)" }}>
              별이의 한 마디
            </div>
          </div>
          <p style={{ fontSize: 14, color: "var(--fg-1)", lineHeight: 1.6 }}>
            요즘 저녁이 좀 늦으셨어요. 오늘은 23시 전에 함께 잠들어볼까요?
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- 5. Mission List ---------- */
function MissionListScreen({ missions, onToggleMission, onAdd }) {
  const [filter, setFilter] = React.useState("all");
  const cats = [
    { id: "all",     label: "전체" },
    { id: "morning", label: "아침" },
    { id: "fitness", label: "운동" },
    { id: "reading", label: "독서" },
    { id: "mind",    label: "마음" },
  ];
  const filtered = filter === "all" ? missions : missions.filter(m => m.category === filter);

  return (
    <div className="screen-enter">
      <Header
        title="미션"
        right={<button className="icon-btn" aria-label="검색"><Icon name="search" size={22}/></button>}
      />
      <div className="screen-body" style={{ paddingTop: 12 }}>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 16, marginLeft: -4, marginRight: -4, paddingLeft: 4, paddingRight: 4 }}>
          {cats.map(c => (
            <Chip key={c.id} selected={filter === c.id} onClick={() => setFilter(c.id)}>{c.label}</Chip>
          ))}
        </div>

        <div className="card" style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 12, background: "var(--accent-soft)", borderColor: "transparent" }}>
          <span style={{ fontSize: 22 }}>✦</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--fg-1)" }}>
              {missions.filter(m => m.done).length}개 완료 · 별가루 +{missions.filter(m => m.done).length * 20}
            </div>
            <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>오늘의 작은 발걸음</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(m => <MissionCard key={m.id} mission={m} onToggle={onToggleMission} />)}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <img src="../../assets/illustration-empty.svg" style={{ width: 140 }} />
              <p style={{ marginTop: 12, color: "var(--fg-3)", fontSize: 14 }}>
                이 카테고리에 미션이 없어요.<br/>새로운 미션을 만들어볼까요?
              </p>
            </div>
          )}
        </div>

        <div style={{ marginTop: 24 }}>
          <Button variant="secondary" onClick={onAdd}>
            <Icon name="plus" size={20} /> 새 미션 추가
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- 6. Character Detail / Care ---------- */
function CharacterDetailScreen({ character, onBack, coins }) {
  const [mood, setMood] = React.useState("default");
  const [bubble, setBubble] = React.useState("오늘도 와줘서 고마워요.");

  const moodImg = mood === "default" ? `../../assets/character-${character}.svg`
                : mood === "happy"   ? `../../assets/character-${character}-happy.svg`
                : mood === "sleepy"  ? `../../assets/character-${character}-sleepy.svg`
                : `../../assets/character-${character}.svg`;

  const care = (label, msg, newMood) => {
    setMood(newMood);
    setBubble(msg);
    setTimeout(() => setMood("default"), 1800);
  };

  return (
    <div className="screen-enter">
      <Header
        title="별이"
        onBack={onBack}
        right={<button className="icon-btn"><Icon name="more" size={22}/></button>}
      />
      <div style={{ padding: "12px 20px 24px" }}>
        {/* Big stage */}
        <div className="stage" style={{ padding: "32px 20px", borderRadius: 28 }}>
          <div className="character-img" style={{ width: 180, height: 180 }}>
            <img src={moodImg} alt="" style={{ width: "100%", height: "100%" }} />
          </div>
          <div className="stage-name" style={{ fontSize: 22 }}>별이 · Lv.3</div>
          <div className="stage-bubble">{bubble}</div>
        </div>

        {/* Stats */}
        <div className="card" style={{ marginTop: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: 20, color: "var(--danger)" }}>♡ 78%</div>
              <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 4 }}>호감도</div>
            </div>
            <div style={{ textAlign: "center", borderLeft: "1px solid var(--border-1)", borderRight: "1px solid var(--border-1)" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: 20, color: "var(--primary)" }}>62/100</div>
              <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 4 }}>다음 Lv까지</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: 20, color: "var(--success)" }}>7일</div>
              <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 4 }}>연속</div>
            </div>
          </div>

          {/* Growth bar */}
          <div style={{ marginTop: 16, background: "var(--bg-3)", height: 10, borderRadius: 999, overflow: "hidden" }}>
            <div style={{ height: "100%", width: "62%", background: "linear-gradient(90deg, var(--primary), var(--accent))", borderRadius: 999, transition: "width 0.6s var(--ease-out)" }} />
          </div>
        </div>

        {/* Care actions */}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, color: "var(--fg-1)", marginBottom: 12 }}>
            함께하기
          </div>
          <div className="care-grid">
            <button className="care-btn" onClick={() => care("밥주기", "맛있어요!", "happy")}>
              <span className="emoji">🍱</span>
              <span className="label">밥 주기</span>
              <span className="cost">10</span>
            </button>
            <button className="care-btn" onClick={() => care("놀기", "신난다!", "happy")}>
              <span className="emoji">🎈</span>
              <span className="label">놀기</span>
              <span className="cost">20</span>
            </button>
            <button className="care-btn" onClick={() => care("재우기", "쿨쿨...", "sleepy")}>
              <span className="emoji">🌙</span>
              <span className="label">재우기</span>
              <span className="cost">무료</span>
            </button>
            <button className="care-btn" onClick={() => care("말걸기", "그랬구나, 잘 들어줄게요.", "happy")}>
              <span className="emoji">💬</span>
              <span className="label">말 걸기</span>
              <span className="cost">AI</span>
            </button>
            <button className="care-btn" onClick={() => care("쓰다듬기", "기분 좋아요~", "happy")}>
              <span className="emoji">✨</span>
              <span className="label">쓰다듬기</span>
              <span className="cost">무료</span>
            </button>
            <button className="care-btn" onClick={() => care("선물", "고마워요!", "happy")}>
              <span className="emoji">🎁</span>
              <span className="label">선물</span>
              <span className="cost">50</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- 7. Shop / Inventory ---------- */
function ShopScreen({ coins, onBack }) {
  const [tab, setTab] = React.useState("shop");
  const [owned, setOwned] = React.useState(["ribbon"]);
  const [equipped, setEquipped] = React.useState("ribbon");

  const items = [
    { id: "hat",     name: "베레모",    price: 120, img: "../../assets/item-hat.svg" },
    { id: "ribbon",  name: "분홍 리본", price: 80,  img: "../../assets/item-ribbon.svg" },
    { id: "balloon", name: "파랑 풍선", price: 150, img: "../../assets/item-balloon.svg" },
    { id: "trophy",  name: "트로피",    price: 300, img: "../../assets/item-trophy.svg" },
    { id: "trophy2", name: "황금 트로피", price: 500, img: "../../assets/item-trophy.svg", locked: true },
    { id: "balloon2",name: "별 풍선",   price: 220, img: "../../assets/item-balloon.svg" },
  ];

  const buy = (it) => {
    if (owned.includes(it.id)) return;
    if (coins < it.price) return;
    setOwned([...owned, it.id]);
  };

  const ownedItems = items.filter(i => owned.includes(i.id));

  return (
    <div className="screen-enter">
      <Header
        title={tab === "shop" ? "상점" : "내 아이템"}
        onBack={onBack}
        right={<Coin amount={coins} />}
      />
      <div className="screen-body" style={{ paddingTop: 12 }}>
        {/* tabs */}
        <div style={{ display: "flex", gap: 8, padding: "0 0 12px", borderBottom: "1px solid var(--border-1)", marginBottom: 16 }}>
          <button
            className={`chip ${tab === "shop" ? "selected" : ""}`}
            onClick={() => setTab("shop")}
          >상점</button>
          <button
            className={`chip ${tab === "inventory" ? "selected" : ""}`}
            onClick={() => setTab("inventory")}
          >내 아이템 ({ownedItems.length})</button>
        </div>

        {tab === "shop" && (
          <>
            <SectionTitle>인기 아이템</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {items.map(it => {
                const isOwned = owned.includes(it.id);
                const cant = !isOwned && coins < it.price;
                return (
                  <button
                    key={it.id}
                    className={`item-card ${isOwned ? "owned" : ""} ${it.locked ? "locked" : ""}`}
                    onClick={() => !it.locked && buy(it)}
                    disabled={it.locked}
                  >
                    <div className="img"><img src={it.img} alt="" /></div>
                    <div className="name">{it.name}</div>
                    {it.locked
                      ? <div className="price"><Icon name="lock" size={11}/> Lv.5</div>
                      : isOwned
                        ? <div className="price" style={{ color: "var(--success)" }}>보유중</div>
                        : <div className={`price ${cant ? "cant" : ""}`}>{it.price}</div>}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {tab === "inventory" && (
          <>
            <SectionTitle>꾸미기</SectionTitle>
            {ownedItems.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <img src="../../assets/illustration-empty.svg" style={{ width: 140 }} />
                <p style={{ marginTop: 12, color: "var(--fg-3)", fontSize: 14 }}>
                  아직 모은 아이템이 없어요.<br/>상점에서 별이의 친구를 꾸며볼까요?
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <button className={`item-card ${equipped === null ? "equipped" : ""}`} onClick={() => setEquipped(null)}>
                  <div className="img" style={{ background: "transparent", display: "grid", placeItems: "center", color: "var(--fg-3)" }}>
                    <Icon name="close" size={28} />
                  </div>
                  <div className="name">없음</div>
                </button>
                {ownedItems.map(it => (
                  <button
                    key={it.id}
                    className={`item-card owned ${equipped === it.id ? "equipped" : ""}`}
                    onClick={() => setEquipped(it.id)}
                  >
                    <div className="img"><img src={it.img} alt="" /></div>
                    <div className="name">{it.name}</div>
                    {equipped === it.id && <div className="price" style={{ color: "var(--primary)" }}>착용중</div>}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen, MissionListScreen, CharacterDetailScreen, ShopScreen });
