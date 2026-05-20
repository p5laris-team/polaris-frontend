# Polaris Design System

> 매일의 작은 루틴이 별친구를 자라게 해요.

**Polaris**는 AI 다마고치형 루틴 컴패니언 서비스를 위한 디자인 시스템입니다. 사용자는 자신만의 별친구 캐릭터를 키우며, 매일의 미션을 완료해 친구를 자라게 합니다. 모바일 퍼스트 웹앱(React)과 안드로이드 네이티브 앱(React Native) 두 표면을 위해 하나의 시각 언어를 공유합니다.

레퍼런스 톤: **말해보카**(캐릭터 중심의 따뜻함) + **토스**(여백, 절제된 정보 밀도).

---

## 📦 Sources & Inputs

이 디자인 시스템은 다음 GitHub 저장소를 시드(seed)로 받았습니다:

- [p5laris-team/polaris-frontend](https://github.com/p5laris-team/polaris-frontend) — React 웹앱 (현재 비어 있음)
- [p5laris-team/polaris](https://github.com/p5laris-team/polaris) — 메인 저장소 (현재 README만 존재)

> ⚠️ 두 저장소 모두 작업 시점에 비어 있어, 이 디자인 시스템은 **사용자 응답을 기반으로 한 v0** 입니다. 실제 코드가 자라나면 이 문서가 진실의 원천(source of truth)이 되도록 의도되었습니다.

---

## 🌟 Brand Concept

### 한 줄 정의

> **별친구를 키우며 루틴을 완성하는, 따뜻한 AI 다마고치.**

### 핵심 기둥 (Brand pillars)

1. **따뜻함 (Warmth)** — 페이퍼 톤 배경, 둥근 모서리, 캐릭터의 동그란 얼굴. 디지털인데 종이 다이어리처럼 포근한 느낌.
2. **차분함 (Calm)** — 자극적이지 않은 색·모션. 토스처럼 한 번에 적게, 여백 많이. 사용자가 부담 없이 매일 들어올 수 있어야 함.
3. **돌봄 (Care)** — 사용자가 캐릭터를 돌보는 동시에, 시스템이 사용자를 돌본다는 양방향 감각. "오늘 잘 지내셨어요?" 같은 부드러운 안부.
4. **성장 (Growth)** — 작은 액션이 쌓여 시각적 변화로 이어짐. 캐릭터 표정·인벤토리·통계가 점진적으로 풍성해짐.

### 캐릭터 (Mascot)

사용자가 온보딩에서 셋 중 하나를 선택:

| 이름 | 컨셉 | 메인 컬러 |
|---|---|---|
| **노바 (Nova)** | 별이 내려앉은 알친구 | 버터 옐로우 + 화이트 |
| **쪼리 (Jjori)** | 모험을 좋아하는 생쥐친구 | 그레이 + 스카이 블루 |
| **무무 (Mumu)** | 새싹이 돋아난 나무밑둥 | 우드 브라운 + 민트 |
| **별이 (Byeori)** | (레거시) 통통한 별친구 | 테라코타 + 버터 옐로우 |
| **구름이 (Gureumi)** | (레거시) 부드러운 구름친구 | 화이트 + 스카이 블루 |
| **콩이 (Kongi)** | (레거시) 동그란 새싹친구 | 버터 옐로우 + 민트 |

각 캐릭터는 기본/행복/졸림/슬픔 등 표정 상태(mood)를 가지며, 루틴 완료에 따라 표정·크기·악세서리가 변화합니다.

> ⚠️ 현재 캐릭터 SVG는 **임시 플레이스홀더**입니다. 정식 일러스트레이터의 작업으로 교체하는 것을 권장합니다. `assets/character-*.svg`를 동일한 viewBox(200×200)로 교체하면 모든 화면에 자동 반영됩니다.

---

## ✍️ CONTENT FUNDAMENTALS — 콘텐츠 원칙

### 톤 & 보이스

- **존댓말 기본**, 부드러운 `~해요/~세요` 어미. 너무 격식적이지 않게.
- **사용자 호칭**: `당신`이라 직접 호명하지 않고, 행동을 주어로 두거나 자연스럽게 생략.
- **시스템 발화**: 캐릭터가 말을 거는 형태가 핵심. "별이가 배고파해요" "오늘 같이 산책할까요?" 같은 1인칭 캐릭터 발화 또는 캐릭터-사용자 사이 매개 톤.
- **명령형은 부드럽게**: `시작하기` ✓ / `지금 바로 시작!` ✗
- **부정 표현 회피**: `실패`보다 `다음에 다시 도전해요`, `오류`보다 `잠깐 연결이 흐려졌어요`.

### 케이싱

- 한국어 라벨/버튼: 그대로 자연스럽게 (`시작하기`, `미션 보러가기`)
- 영문 라벨: 문장형 케이스 (`Get started`)
- 헤딩: 부제목과 분리하여 줄바꿈 처리, 부제는 더 옅은 색

### 카피 길이

- **헤드라인**: 한국어 8~14자 (모바일 한 줄)
- **부제/리드**: 16~30자
- **버튼**: 2~6자 (`시작하기`, `다음`, `데려가기`)
- **빈 상태**: 한 줄 따뜻한 문장 + 한 줄 액션 안내
- **캐릭터 발화**: 12~24자, 말풍선 안에 들어갈 정도

### 이모지 / 특수문자

- **이모지는 거의 사용하지 않음**. 캐릭터 일러스트가 감정 표현을 담당.
- 예외: 별 글리프 `★` `✦` `✧`를 축하·완료 순간에 절제해서.
- 알림/푸시에서 한정적으로 ✨ 정도 허용.

### 구체적 카피 예시

| 상황 | ✅ Polaris 스타일 | ❌ 피할 카피 |
|---|---|---|
| 온보딩 시작 | `오늘부터 함께할 친구를 골라볼까요?` | `Polaris에 오신 것을 환영합니다! 🎉` |
| 캐릭터 발화 (홈) | `오늘은 어떤 미션을 함께할까요?` | `안녕! 미션 시작해!` |
| 미션 완료 | `별이가 두 칸 자랐어요.` | `미션 완료! +100 EXP` |
| 빈 미션 목록 | `오늘의 미션이 비어 있어요.\n별이가 무엇을 할지 기다리고 있어요.` | `데이터가 없습니다.` |
| 에러 | `잠시 연결이 흐려졌어요.\n다시 시도해 주세요.` | `네트워크 오류. 다시 시도하세요.` |
| 푸시 알림 | `별이가 같이 산책하고 싶대요 ✦` | `[알림] 미션을 수행하세요.` |
| 로그아웃 직전 | `별이가 잠깐 잠들 거예요.\n다음에 또 만나요.` | `정말 로그아웃 하시겠습니까?` |
| 상점 비어있음 | `아직 모은 별가루가 부족해요.\n미션을 완료해 모아볼까요?` | `재화 부족` |

### 라이팅 체크리스트

- [ ] 존댓말 `~요/~세요` 어미?
- [ ] 8~14자 안에 핵심이?
- [ ] 느낌표·이모지에 기대지 않음?
- [ ] 명령형이 부드러운가?
- [ ] 부정 표현을 긍정적으로 바꿀 수 있는가?
- [ ] 캐릭터 발화라면 자연스러운 1인칭인가?

---

## 🎨 VISUAL FOUNDATIONS — 시각 기초

### 컬러 시스템

전체 토큰은 [`colors_and_type.css`](./colors_and_type.css) 참고. **3개의 테마 옵션**을 제공하며, 사용자/제품 단계에서 하나를 선택하거나 사용자 설정으로 노출할 수 있습니다.

| 테마 | 배경 | 메인 (Primary) | 액센트 | 분위기 |
|---|---|---|---|---|
| **Latte** (기본) | `#FAF5E9` 따뜻한 크림 | `#E07A5F` 테라코타 | `#F4D35E` 버터 옐로우 | 종이 다이어리, 가장 따뜻 |
| **Mint** | `#EEF7F0` 청량 민트 | `#4FB3A4` 소프트 틸 | `#F4D35E` 버터 | 산뜻하고 식물적 |
| **Cloud** | `#F2F5FB` 페이퍼 스카이 | `#6F90DA` 소프트 블루 | `#F7B5A8` 피치 | 차분하고 새벽 같은 |

**테마 전환**: `<html data-theme="latte|mint|cloud">` 속성으로. 기본은 Latte.
**다크 모드**: `<html data-mode="dark">`. 모든 테마와 결합 가능.

**의미 색**: 성공 `#5B9A6F` 세이지, 경고 `#D98531` 호박, 위험 `#C95252` 차분한 코랄 — 모두 채도를 낮춰 브랜드와 통일감 유지.

**시멘틱 토큰 우선**: `--fg-1`, `--bg-1`, `--primary`, `--border-2`를 우선 사용. 원시 팔레트(`--clay-700`)는 fallback.

### 타이포그래피

- **본문/UI 기본**: **Pretendard Variable** — 요즘 한글 디자인 표준. 안정적이고 모던.
- **디스플레이 옵션**: **SUIT Variable** — Pretendard보다 살짝 더 둥글고 친근. 헤딩과 큰 숫자에 사용.
- **캐릭터 / 감성**: **Gaegu** — 손글씨 느낌. 캐릭터 말풍선, 빈 상태 한 줄 카피 한정.
- **모노스페이스**: **JetBrains Mono** — 통계 수치, 코드.

> 두 가지 헤딩 스타일을 사용 시점에 선택할 수 있도록 `--font-display`를 분리했습니다. 기본은 SUIT이며, Pretendard만 쓰고 싶으면 토큰에서 `--font-display`를 `var(--font-sans)`로 변경하면 됩니다.

**스케일 (Toss 영향)**: 본문이 17px, 헤딩은 22~32px로 큼직. 한 화면에 정보를 적게, 여백을 많이.

**라인 하이트**: 한글 가독성 위해 본문 1.55~1.7로 넉넉. `letter-spacing`은 한글 본문 0, 헤딩만 -0.02em.

### 간격 (Spacing) — Toss 스타일

- 4px 베이스: `0, 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64, 80, 96`
- 모바일 화면 좌우 가장자리: **`--space-6 (24px)`**
- 카드 내부 패딩: **`--space-6 (24px)`**
- 인풋 내부 패딩: 세로 `--space-4`, 가로 `--space-5`
- 섹션 사이: `--space-8 (32px)` 또는 `--space-12 (48px)`
- 큰 히어로 영역 상하: `--space-12 ~ --space-20`

### 배경 (Backgrounds)

- **단색 + 미세한 별가루** 패턴이 기본. 풀블리드 사진 배경은 거의 사용하지 않음.
- **그라데이션 규칙**:
  - 큰 보라→파랑 그라디언트 **금지** (AI 슬롭 룩)
  - 허용: 같은 색의 100→200 단계 미묘 그라디언트 (히어로의 따뜻한 후광)
  - 허용: 캐릭터 뒤 원형 글로우 (`--bg-character` 사용)
- **별가루 패턴**: [`assets/pattern-stardust.svg`](./assets/pattern-stardust.svg) 반복 타일링. 어두운/큰 영역에 0.4~0.6 opacity로 절제 사용.

### 카드 & 보더

- **카드 = 흰 배경 + 1px hairline + 옅은 그림자** (좌측 컬러 보더 금지)
- 기본: `background: var(--bg-2)`, `border: 1px solid var(--border-1)`, `border-radius: var(--radius-lg)(20px)`, `box-shadow: var(--shadow-sm)`
- 캐릭터 카드는 특별: `box-shadow: var(--shadow-character)` (메인 컬러 살짝 빛나는 그림자)
- 보더 컬러는 항상 `rgba(45,36,24,alpha)` (다크: `rgba(255,245,226,alpha)`) — 컬러 보더 금지

### 코너 반경 — **둥글둥글 취향**

| 토큰 | 값 | 용도 |
|---|---|---|
| `--radius-xs` | 6px | 작은 칩, 인디케이터 |
| `--radius-sm` | 10px | 인풋 안 작은 컨트롤 |
| `--radius-md` | 14px | 인풋, 작은 버튼 |
| `--radius-button` | 16px | **버튼 전용 (살짝 더 둥글게)** |
| `--radius-lg` | 20px | **카드 기본** |
| `--radius-xl` | 28px | 큰 카드, 시트 |
| `--radius-2xl` | 36px | 모달 상단, 메인 히어로 |
| `--radius-pill` | 999px | 칩, 태그, 작은 배지 |

기본 컴포넌트는 20px 카드 + 16px 버튼이 가장 자주 등장하는 페어.

### 그림자 / Elevation

5단계 + 캐릭터 전용 1개. 색은 **따뜻한 회갈색**(`rgba(45, 36, 24, …)`).

- `--shadow-xs` 호버 hint
- `--shadow-sm` 카드 기본
- `--shadow-md` FAB, 메뉴
- `--shadow-lg` 모달
- `--shadow-xl` 풀스크린 시트
- `--shadow-character` 캐릭터 카드 전용 — 메인 컬러 살짝 빛나는 페더

글로우:
- `--glow-primary` 4px 반투명 메인 컬러 (포커스 링)
- `--glow-accent` 축하 순간 한정 (목표 달성)

### 모션 (Animation)

**원칙: 부드럽고 친근. UI는 절제, 캐릭터는 살짝 통통.**

- 이징: `--ease-out`(0.22, 1, 0.36, 1) 기본. 마지막 부드럽게 안착.
- **캐릭터 등장·점프**는 `--ease-spring`(0.34, 1.56, 0.64, 1)로 살짝 통통.
- 시간: micro 80 / fast 140 / base 220 / slow 360 / deliberate 520 / character 680ms.
- 페이지 진입: fade + 8px 위로 슬라이드, 220ms.
- **반복 펄스 금지**. 캐릭터 호흡(breathing) 애니메이션은 4초 cycle, 매우 미묘하게 OK.
- `prefers-reduced-motion: reduce` 항상 존중.

### 호버 / 프레스

- **호버 (웹)**: primary 버튼 → `--primary-hover`. 카드 → 그림자 한 단계 상승 + 2px 위로.
- **프레스 (모바일)**: 버튼 `scale(0.96)` 100ms. 카드 → `--bg-3` 살짝 깜빡.
- **포커스**: 키보드 포커스에 항상 `--glow-primary` 4px 링. `outline:none` 금지.

### 투명도 & 블러

- 블러는 매우 절제. 풀스크린 모달 스크림(`--scrim`)은 단색 반투명.
- 예외: 모바일 sticky 헤더에 `backdrop-filter: blur(8px)` + 반투명 배경.
- 카드 내부 glassmorphism은 사용 금지.

### 이미지 톤

- 캐릭터 일러스트는 **flat + 단순 형태 + 한 톤의 채도 낮은 색**. 그라디언트나 사실적 셰이딩 없음.
- 사진을 쓴다면 자연광, 따뜻한 톤, 채도 낮음. 형광 채도 금지.
- 일러스트는 1~2색 + 흑갈색 라인 스타일.

### 레이아웃 규칙

- 모바일 퍼스트, 기본 컨테이너 `max-width: 480px`. 그 위는 가운데 정렬 + 양쪽 여백.
- 모바일 고정 요소: 상단 헤더 56px, 하단 탭바 64px + safe-area-inset-bottom.
- 모든 인터랙티브 요소 최소 터치 영역 **44×44px**.
- 풀블리드 섹션의 내부 콘텐츠는 항상 좌우 24px 패딩.

### Don't List

Polaris에서 **하지 않는** 것들:

- 보라→파랑 큰 면적 그라디언트 (AI 슬롭 룩)
- 카드 좌측 컬러 보더만 두기 (`border-left: 4px solid #...`)
- 채도 높은 형광 컬러
- 이모지로 카드 헤더 장식
- 무한 펄스/스파클 애니메이션
- 시스템 폰트 스택만 의존 (Pretendard·SUIT 반드시 로드)
- 캐릭터에 비례 무시한 sticker처럼 박힌 표정 (모든 표정은 같은 SVG 시스템 안에서)

---

## 🔣 ICONOGRAPHY — 아이콘

### 시스템 (혼용)

답변에 따라 **커스텀 일러스트 + 아이콘 혼용** 방식을 채택:

1. **기능 아이콘**: [**Lucide**](https://lucide.dev) — 24×24, 1.5px stroke, 둥근 캡. 모던하고 군더더기 없음.
2. **카테고리 / 감정 일러스트**: 커스텀 SVG (`assets/cat-*.svg`, `assets/character-*.svg`). 동그란 컨테이너 + 1~2색 + 단순 형태.

### 사용 규칙

- 기본 크기: 인라인 라벨 `20px` / 단독 아이콘 버튼 `24px` / 히어로 영역 `28~32px`.
- 색은 `currentColor` — 상위 텍스트 색 상속.
- 액션 아이콘: `--primary` / 정보: `--fg-2` / 위험: `--danger`.
- 채우기 아이콘은 **선택된 상태** 한정 (탭바 활성, 즐겨찾기 ON).
- 커스텀 일러스트(`cat-*.svg`)는 80×80 둥근 배경 컨테이너로 통일.

### CDN / 설치

```bash
# Web
npm install lucide-react

# React Native
npm install lucide-react-native react-native-svg
```

```jsx
import { Heart, Sparkles, ChevronRight } from 'lucide-react';
<Heart size={20} strokeWidth={1.75} />
```

### 브랜드 자산

| 파일 | 용도 |
|---|---|
| `assets/logo-wordmark.svg` | 캐릭터 + "Polaris" 워드마크 (헤더, 마케팅) |
| `assets/logomark.svg` | 64×64 앱 아이콘 / 파비콘 |
| `assets/star-mark.svg` | 4포인트 별 단독 (currentColor, 작은 액센트) |
| `assets/character-nova.png` | 노바 — 기본 표정 |
| `assets/character-nova-happy.png` | 노바 — 행복 |
| `assets/character-nova-sleepy.png` | 노바 — 졸림 |
| `assets/character-jjori.png` | 쪼리 — 기본 |
| `assets/character-mumu.png` | 무무 — 기본 |
| `assets/character-byeori.svg` | 별이 — 기본 표정 (레거시) |
| `assets/character-byeori-happy.svg` | 별이 — 행복 (레거시) |
| `assets/character-byeori-sleepy.svg` | 별이 — 졸림 (레거시) |
| `assets/character-gureumi.svg` | 구름이 — 기본 (레거시) |
| `assets/character-kongi.svg` | 콩이 — 기본 (레거시) |
| `assets/pattern-stardust.svg` | 별가루 배경 패턴 (타일 반복) |
| `assets/illustration-empty.svg` | 빈 상태 일러스트 |
| `assets/cat-morning.svg` | 카테고리 — 모닝 |
| `assets/cat-fitness.svg` | 카테고리 — 운동 |
| `assets/cat-reading.svg` | 카테고리 — 독서 |
| `assets/cat-mind.svg` | 카테고리 — 마음 |
| `assets/item-*.svg` | 상점 아이템 (모자, 리본, 풍선, 트로피) |

### 이모지

거의 사용 금지. 예외:
- 알림에서 ✨ ✦ 정도 한정
- 본문 텍스트에서는 사용 안 함

### 폰트 안에 들어있는 아이콘?

별도 아이콘 폰트 없음. SVG + Lucide 사용.

---

## 📁 Index — 파일 안내

| 경로 | 내용 |
|---|---|
| [`README.md`](./README.md) | 이 문서 — 브랜드 컨셉, 콘텐츠·시각 원칙, 아이콘 가이드 |
| [`SKILL.md`](./SKILL.md) | Agent Skill 메타데이터 |
| [`colors_and_type.css`](./colors_and_type.css) | 모든 디자인 토큰 (3 테마 + 다크모드) |
| [`assets/`](./assets/) | 로고, 캐릭터, 카테고리·아이템 일러스트, 패턴 |
| [`fonts/`](./fonts/) | 웹폰트 가이드 (CDN 기본, 자체호스팅 교체 가이드) |
| [`preview/`](./preview/) | 디자인 시스템 카드 (Design System 탭에서 렌더됨) |
| [`ui_kits/web/`](./ui_kits/web/) | 웹 UI 키트 — React/JSX, 7개 핵심 화면 |
| [`ui_kits/mobile/`](./ui_kits/mobile/) | 모바일 UI 키트 — RN 호환 스타일, Android 프레임 |

---

## ⚙️ 빠른 사용 예 (Quickstart)

```html
<link rel="stylesheet" href="./colors_and_type.css">
<!-- 테마 전환 -->
<html data-theme="latte" data-mode="light">
  <body>
    <h1>오늘의 미션</h1>
    <p class="text-lead">별이가 함께할 준비를 마쳤어요.</p>
    <button class="btn-primary">시작하기</button>
  </body>
</html>
```

React에서:

```jsx
import './colors_and_type.css';
import { Button, MissionCard, CharacterStage } from './ui_kits/web/components';
```

React Native에서는 토큰을 JS 객체로 변환한 `tokens.js`를 import — `ui_kits/mobile/README.md` 참고.

---

## 🛠 Caveats — 알려진 한계

- 캐릭터·일러스트 SVG는 모두 **임시 플레이스홀더**입니다. 정식 일러스트레이터의 작업으로 교체하는 것을 강하게 권장합니다. (동일 viewBox로 교체 시 자동 반영)
- 폰트(Pretendard, SUIT, Gaegu, JetBrains Mono)는 모두 CDN(jsDelivr/Google Fonts)에서 로드. 오프라인·자체호스팅이 필요하면 [`fonts/README.md`](./fonts/README.md) 가이드 참고.
- 두 GitHub 저장소가 비어 있어 실제 코드베이스에서 컴포넌트를 역공학할 수 없었습니다. 저장소가 채워지면 이 시스템을 재검증하세요.
- React Native UI 키트는 RN 호환 스타일로 작성되었지만, 실제 RN 런타임 검증은 별도로 필요합니다 (현재는 HTML/JSX로 시각적 재현).
- 3가지 테마(Latte/Mint/Cloud)는 모두 동일한 컴포넌트와 토큰 구조에서 동작하므로, 최종 하나를 선택하거나 사용자 설정으로 노출 가능합니다.
