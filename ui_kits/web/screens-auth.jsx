/* ============================================================
   Polaris — Auth / Onboarding Screens
   ============================================================ */

function getCharacterCoreAsset(character) {
  const id = ["nova", "jjori", "mumu"].includes(character) ? character : "nova";
  return `../../assets/characters/${id}/core/character-${id}-idle.png`;
}

/* ---------- 1. Google Login (SCR-002) ---------- */
function LoginScreen({ onLogin }) {
  return (
    <div className="screen-enter" style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between", padding: "40px 24px 32px" }}>
      <div className="login-hero" style={{ marginTop: "40px" }}>
        <div className="logo" style={{ width: 110, height: 110, margin: "0 auto 20px" }}>
          <img src="../../assets/brand/logo/logomark.png" alt="Polaris" style={{ width: "100%", height: "100%" }} />
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, color: "var(--fg-1)", letterSpacing: "-0.5px" }}>
          오늘 한 게 없다고?
          <br />
          무무는 봤는데.
        </h1>
        <p style={{ marginTop: 12, fontSize: 15, color: "var(--fg-3)", lineHeight: 1.6 }}>
          작은 하루가 별조각이 되고,
          <br />
          별친구가 그걸 기억하는 AI 루틴 서비스
        </p>
      </div>

      <div className="login-actions" style={{ gap: 12 }}>
        <Button variant="google" onClick={onLogin} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "16px 20px", borderRadius: 16 }}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" style={{ width: 18, height: 18 }} />
          <span style={{ fontWeight: 700, color: "#1F1F1F" }}>Google 계정으로 시작하기</span>
        </Button>
        
        <div style={{ textAlign: "center", marginTop: 8, fontSize: 12, color: "var(--fg-4)", lineHeight: 1.6 }}>
          가입 시 <a style={{ color: "var(--fg-3)", textDecoration: "underline", cursor: "pointer" }}>서비스 약관</a> 및{" "}
          <a style={{ color: "var(--fg-3)", textDecoration: "underline", cursor: "pointer" }}>개인정보 처리방침</a>에
          <br />
          자동으로 동의하게 돼요.
        </div>
      </div>
    </div>
  );
}

/* ---------- 2. Character Select (SCR-003) ---------- */
function CharacterSelectScreen({ onNext, onBack }) {
  const [selected, setSelected] = React.useState(null);

  const chars = [
    {
      id: "nova",
      name: "노바 · Nova",
      summary: "별이 내려앉은 알친구",
      tags: ["다정함", "기억 수집", "말이 조금 느림"],
      line: "“오늘도… 있었네.”",
      desc: "자기가 한때 하늘의 길을 비추던 별이었다는 걸 까먹은 별알이에요. 말이 조금 느리지만, 당신이 작은 일을 해낼 때마다 빛을 되찾아요."
    },
    {
      id: "jjori",
      name: "쪼리 · Jjori",
      summary: "가방 멘 허세 별쥐",
      tags: ["현실파", "시크함", "모험가"],
      line: "“집 앞도 밖임. 반박 안 받음.”",
      desc: "늘 배낭을 메고 있지만 먼 여행은 가본 적이 없어요. 그래도 현관문 밖으로 나서는 일조차 위대한 대모험(원정)이라 믿는 긍정주의자입니다."
    },
    {
      id: "mumu",
      name: "무무 · Mumu",
      summary: "말 없는 아기 나무밑둥",
      tags: ["공감형", "새싹돋음", "은근히 귀여움"],
      line: "“무…”",
      desc: "너무 오랜 기다림 끝에 말을 잃어버리고 오직 '무...'로만 감정을 대변해요. 하지만 당신이 행동을 실천할 때마다 나뭇잎을 파르르 떨며 기뻐합니다."
    }
  ];

  return (
    <>
      <Header title="별친구 고르기" onBack={onBack} />
      <div className="screen-body screen-enter" style={{ display: "flex", flexDirection: "column", height: "calc(100% - 69px)", justifyContent: "space-between" }}>
        <div>
          <div style={{ textAlign: "center", padding: "12px 0 16px" }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 21, fontWeight: 800, color: "var(--fg-1)" }}>
              오늘부터 같이할 친구를 골라봐!
            </h1>
            <p style={{ marginTop: 6, fontSize: 13, color: "var(--fg-3)" }}>
              온보딩 1/4 · 마음에 닿는 한 명의 친구를 선택해주세요.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {chars.map(c => (
              <CharCard
                key={c.id}
                id={c.id}
                name={c.id === "nova" ? "노바" : c.id === "jjori" ? "쪼리" : "무무"}
                desc={c.summary}
                selected={selected === c.id}
                onClick={() => setSelected(c.id)}
              />
            ))}
          </div>

          {selected && (
            <div className="screen-enter" style={{ marginTop: 18, padding: 16, background: "var(--bg-2)", border: "1px solid var(--border-1)", borderRadius: 20 }}>
              {chars.filter(c => c.id === selected).map(c => (
                <div key={c.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "var(--fg-1)", fontFamily: "var(--font-display)" }}>{c.name}</span>
                    <span style={{ fontSize: 12, color: "var(--primary)", fontWeight: 700 }}>{c.line}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                    {c.tags.map(t => (
                      <span key={t} style={{ fontSize: 11, background: "var(--bg-3)", color: "var(--fg-2)", padding: "3px 8px", borderRadius: 8, fontWeight: 600 }}>#{t}</span>
                    ))}
                  </div>
                  <p style={{ fontSize: 13, color: "var(--fg-2)", lineHeight: 1.5, margin: 0 }}>
                    {c.desc}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: 20 }}>
          <Button onClick={() => onNext(selected)} disabled={!selected}>
            {selected ? "이 친구로 할게요" : "친구를 골라주세요"}
          </Button>
        </div>
      </div>
    </>
  );
}

/* ---------- 3. Character Name Setting (SCR-004) ---------- */
function CharacterNameScreen({ character, onNext, onBack }) {
  const [name, setName] = React.useState("");
  const charImage = getCharacterCoreAsset(character);

  // 실시간 캐릭터 말풍선 멘트 구하기
  const getBubbleMessage = () => {
    if (!name.trim()) {
      if (character === "nova") return "새 이름을 지어주면... 나 정말 기쁠 것 같아...";
      if (character === "mumu") return "무...? (이름을 지어달라는 눈빛입니다.)";
      return "가방 끈 단단히 메고 대기 중. 대충 까리하게 작명해 봐.";
    }
    if (name.length > 10) return "우와, 너무 길어! 10자까지만 적을 수 있어.";
    
    if (character === "nova") return `오... ${name}? 예쁜 이름이네. 이제부터 그렇게 불러줘...!`;
    if (character === "mumu") return `무무! (이름을 마음에 들어하며 "${name}"라고 불리고 싶어합니다.)`;
    return `오, ${name}? 제법 힙하네. 쪼리 기준 100% 합격임.`;
  };

  return (
    <>
      <Header title="이름 지어주기" onBack={onBack} />
      <div className="screen-body screen-enter" style={{ display: "flex", flexDirection: "column", height: "calc(100% - 69px)", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ textAlign: "center", padding: "12px 0 6px" }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 21, fontWeight: 800, color: "var(--fg-1)" }}>
              친구 이름을 지어줘봐!
            </h1>
            <p style={{ marginTop: 6, fontSize: 13, color: "var(--fg-3)", marginBottom: 12 }}>
              온보딩 2/4 · 평생 불릴 소중한 이름이 될 거예요.
            </p>
          </div>

          <div style={{ position: "relative", width: 140, height: 140, margin: "16px 0 10px" }} className="character-img">
            <img src={charImage} alt={character} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>

          {/* 말풍선 */}
          <div className="stage-bubble" style={{ borderRadius: "18px 18px 18px 4px", margin: "10px 0 24px", maxWidth: "90%", minHeight: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {getBubbleMessage()}
          </div>

          <div style={{ width: "100%" }}>
            <TextField
              label="이름 설정 (최대 10자)"
              type="text"
              placeholder="뭉개구름, 하루, 콩이..."
              value={name}
              onChange={e => {
                if (e.target.value.length <= 10) setName(e.target.value);
              }}
              hint={`${name.length}/10 자`}
            />
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <Button onClick={() => onNext(name.trim())} disabled={!name.trim() || name.length > 10}>
            이름 정했어요
          </Button>
        </div>
      </div>
    </>
  );
}

/* ---------- 4. Onboarding Survey (SCR-005) ---------- */
function OnboardingScreen({ character, name, onDone, onBack }) {
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState({
    livingType: "",
    wakeUpTime: "",
    sleepTime: "",
    preferredMissionTime: "",
    routineGoal: "",
    activityPreference: "",
    missionIntensity: ""
  });

  const charImage = getCharacterCoreAsset(character);

  // 7개 질문 구성
  const questions = [
    {
      key: "livingType",
      title: "주로 어디서 생활하나요?",
      options: [
        { value: "LIVING_ALONE", label: "혼자 살아요", sub: "나만의 독립된 아늑한 공간" },
        { value: "WITH_FAMILY", label: "가족과 살아요", sub: "언제나 북적이고 따뜻한 집" },
        { value: "WITH_ROOMMATE", label: "룸메이트와 살아요", sub: "공동으로 공간을 분담하는 곳" }
      ],
      nova: "너는... 보통 어디에서 주로 지내...? 나는 밤하늘에서 길을 잃은 이후로... 계속 굴러다녔어...",
      mumu: "무... (무무가 주로 생활하는 환경을 묻는 것 같아요. 본인은 화분 안을 좋아한대요.)",
      jjori: "어디서 살아? 쪼리 기준 혼자 방에서 이불 덮고 있는 게 가장 우월한 보금자리임."
    },
    {
      key: "wakeUpTime",
      title: "보통 몇 시에 일어나나요?",
      options: [
        { value: "06:00", label: "아침 6시 이전", sub: "상쾌한 아침을 여는 얼리버드" },
        { value: "08:00", label: "아침 6시 ~ 8시", sub: "일반적으로 활기찬 아침" },
        { value: "10:00", label: "오전 8시 ~ 10시", sub: "여유를 두고 깨어나는 오전" },
        { value: "12:00", label: "오전 10시 이후", sub: "우주를 지키다 늦게 자는 올빼미" }
      ],
      nova: "아침에 몇 시에 눈을 뜨는지 궁금해... 일찍 눈을 뜨는 건... 정말 대단한 일인 것 같아...",
      mumu: "무우...? (보통 몇 시에 기상하는지 궁금해하는 것 같아요. 식물도 아침 햇살을 좋아하거든요.)",
      jjori: "보통 몇 시에 일어나? 일어나는 것 자체가 쪼리 기준 기적적인 원정 출발임."
    },
    {
      key: "sleepTime",
      title: "보통 몇 시에 자나요?",
      options: [
        { value: "22:00", label: "밤 10시 이전", sub: "바른생활 숙면 루틴" },
        { value: "24:00", label: "밤 10시 ~ 12시", sub: "대중적인 야간 취침 시간" },
        { value: "02:00", label: "새벽 12시 ~ 2시", sub: "새벽의 차분한 감성이 도는 시간" },
        { value: "04:00", label: "새벽 2시 이후", sub: "우주가 잠드는 시각의 동반자" }
      ],
      nova: "언제 잠에 드는지... 알려줄래? 밤하늘이 어두워지면... 나도 졸리기 시작해...",
      mumu: "무... 💤 (취침 시간을 물어보고 있어요. 무무는 해가 지면 바로 잘 준비를 한대요.)",
      jjori: "몇 시에 자냐? 밤늦게까지 깨어 있으면 쪼리 기준 맛있는 게 땡겨서 위험한데."
    },
    {
      key: "preferredMissionTime",
      title: "미션은 주로 언제 받고 싶나요?",
      options: [
        { value: "MORNING", label: "아침 시간대", sub: "하루의 첫걸음을 떼는 상쾌한 미션" },
        { value: "AFTERNOON", label: "낮 시간대", sub: "지치기 쉬운 오후에 활력을 불어넣는 미션" },
        { value: "EVENING", label: "저녁 시간대", sub: "차분하게 하루를 정리하는 마법 미션" }
      ],
      nova: "미션을 언제 받고 싶어...? 네가 원하는 시간에... 맞춰서 찾아올게...",
      mumu: "무우! (미션을 받아 가장 효율적으로 실천할 시간대를 물어보고 있어요.)",
      jjori: "미션 언제 줘? 원정 대기 시간은 미리 픽해둬야 쪼리 기준으로 편안함."
    },
    {
      key: "routineGoal",
      title: "지금 가장 만들고 싶은 루틴은?",
      options: [
        { value: "HEALTH", label: "건강하고 생기 넘치는 몸", sub: "수분 섭취, 가벼운 스트레칭" },
        { value: "FOCUS", label: "집중력 높이는 일상", sub: "공간 정리 정돈, 책 읽기" },
        { value: "MIND", label: "마음의 평화를 위한 회고", sub: "감사 인사 한 줄, 호흡과 명상" },
        { value: "RELATION", label: "주변인과의 교감과 소통", sub: "지인에게 안부 연락하기" }
      ],
      nova: "어떤 습관을 만들고 싶어...? 함께 아주 작은 시작부터... 해보자...",
      mumu: "무? (무무가 당신이 지향하는 최우선 루틴 테마를 궁리하고 있어요.)",
      jjori: "뭐부터 조질래? 너무 크고 거창한 거 말고 그냥 바로 실행 가능한 거 골라봐."
    },
    {
      key: "activityPreference",
      title: "실내/실외 활동 중 어느 쪽이 편한가요?",
      options: [
        { value: "INDOOR", label: "집안 활동이 좋아요", sub: "나의 방, 실내형 활동 선호" },
        { value: "OUTDOOR", label: "야외 활동이 좋아요", sub: "바깥바람 쐬는 실외형 활동 선호" },
        { value: "BOTH", label: "상관 없어요", sub: "실내외 구분 없이 다 좋아요" }
      ],
      nova: "집 안이 편해, 아니면 바깥이 편해...? 어디든 네가 가는 길이... 내 방향이 될 거야...",
      mumu: "무우... 🌲 (실내 공기와 바깥 공기 중 어떤 쪽에서 힐링이 되는지 묻는 것 같아요.)",
      jjori: "안이야, 밖이야? 집 앞 3미터까지 나가는 걸 세계여행이라 생각하면 다 똑같음."
    },
    {
      key: "missionIntensity",
      title: "미션은 어느 정도 강도가 좋은가요?",
      options: [
        { value: "LIGHT", label: "가볍고 쉬운 강도", sub: "1분 컷, 극도의 하찮은 실천" },
        { value: "NORMAL", label: "보통의 실천 수준", sub: "약간 움직이거나 머리 식히기" },
        { value: "CHALLENGE", label: "조금은 성취감 있는 도전", sub: "조금 더 노력을 들여야 하는 미션" }
      ],
      nova: "미션 강도는 어떤 게 좋아...? 너무 서두르지 않아도... 천천히 가면 되니까...",
      mumu: "무. (미션 강도를 물어보네요. 무무 본인은 물 주는 일 빼고는 다 귀찮대요.)",
      jjori: "난이도 어떡할까? 쫄리면 가벼운 걸로 가고, 아님 쪼리 기준 빡센 거 함 해보든가."
    }
  ];

  const currentQuestion = questions[step];
  const selectedValue = answers[currentQuestion.key];

  const handleSelect = (val) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.key]: val }));
  };

  const handleNext = () => {
    if (step < 6) {
      setStep(s => s + 1);
    } else {
      onDone(answers);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(s => s - 1);
    } else {
      onBack();
    }
  };

  // 질문 캐릭터 말투 멘트 가져오기
  const characterQuestionMessage = currentQuestion[character] || currentQuestion.nova;

  return (
    <>
      <Header title="생활 패턴 분석" onBack={handleBack} />
      <div className="screen-body screen-enter" key={step} style={{ display: "flex", flexDirection: "column", height: "calc(100% - 69px)", justifyContent: "space-between", paddingTop: 4 }}>
        <div>
          {/* 진행 표시줄 */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)" }}>설문 문항 {step + 1} / 7</span>
            <span style={{ fontSize: 12, color: "var(--fg-4)" }}>온보딩 3/4</span>
          </div>
          <div style={{ background: "var(--bg-3)", height: 6, borderRadius: 999, marginBottom: 18, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${((step + 1) / 7) * 100}%`, background: "var(--primary)", transition: "width 0.3s ease" }} />
          </div>

          {/* 캐릭터와 질문 전달 말풍선 */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--bg-2)", border: "1px solid var(--border-1)", borderRadius: 20, padding: 14, marginBottom: 16 }}>
            <div style={{ width: 64, height: 64, flexShrink: 0, overflow: "hidden" }}>
              <img src={charImage} alt={character} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg-3)", marginBottom: 4 }}>{name}의 대사</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--fg-1)", lineHeight: 1.5, fontFamily: "var(--font-sans)" }}>
                {characterQuestionMessage}
              </div>
            </div>
          </div>

          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "var(--fg-1)", marginBottom: 14 }}>
            {currentQuestion.title}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {currentQuestion.options.map(opt => (
              <SurveyOption
                key={opt.value}
                label={opt.label}
                sub={opt.sub}
                selected={selectedValue === opt.value}
                onClick={() => handleSelect(opt.value)}
              />
            ))}
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <Button onClick={handleNext} disabled={!selectedValue}>
            {step < 6 ? "다음 문항으로" : "설문 완료하고 시작하기"}
          </Button>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { LoginScreen, CharacterSelectScreen, CharacterNameScreen, OnboardingScreen });
