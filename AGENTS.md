# Polaris Frontend AGENTS.md

이 저장소는 Polaris 프런트엔드를 구현하기 위한 **화면 디자인 기준 프로젝트**다.

AI 코딩 에이전트는 이 저장소에 들어 있는 모바일/웹 화면 디자인을 참고 수준으로만 보지 말고, 실제 구현 결과가 최대한 같은 구조, 톤, 간격, 색상, 컴포넌트 형태, 화면 흐름을 갖도록 만들어야 한다.

## 1. 가장 중요한 원칙

구현 목표는 "새롭게 해석한 Polaris 앱"이 아니다.

구현 목표는 아래 디자인 원본과 **동일하게 보이는 프런트엔드**다.

- 모바일 앱 디자인 원본: `ui_kits/mobile/index.html`
- 웹 디자인 원본: `ui_kits/web/index.html`

새 화면, 새 레이아웃, 새 컬러, 새 컴포넌트 스타일을 임의로 만들지 않는다. 디자인 원본에 이미 존재하는 패턴을 먼저 찾고, 그 패턴을 React Native 앱과 React 웹 앱으로 옮긴다.

## 2. 프로젝트 성격

Polaris는 사용자가 고른 별친구 캐릭터가 하루의 작은 미션을 제안하고, 사용자가 완료한 행동을 별조각과 캐릭터 성장으로 기록하는 AI 다마고치형 루틴 서비스다.

이 저장소에는 실제 제품 구현에 앞서 아래 자료가 정리되어 있다.

- 제품 요구사항
- API 명세
- 화면 설계서
- 디자인 시스템
- 색상/타이포그래피 토큰
- 캐릭터/브랜드 에셋
- 모바일 화면 디자인
- 웹 화면 디자인

프런트엔드 구현 시 이 저장소를 source of truth로 삼는다.

## 3. 반드시 확인할 파일

작업 전에 관련 파일을 확인한다.

우선순위:

1. `ui_kits/mobile/index.html`
2. `ui_kits/web/index.html`
3. `ui_kits/mobile/mobile-app.jsx`
4. `ui_kits/web/app.jsx`
5. `ui_kits/web/components.jsx`
6. `ui_kits/web/screens-auth.jsx`
7. `ui_kits/web/screens-app.jsx`
8. `ui_kits/web/styles.css`
9. `ui_kits/mobile/tokens.js`
10. `colors_and_type.css`
11. `docs/product/07-Screen-Design-Specification.md`
12. `docs/product/PRD.md`
13. `docs/api/01-API-spec.md`

화면 구현 중 디자인이 헷갈리면 PRD보다 먼저 UI kit을 확인한다. PRD는 제품 의도와 정책의 기준이고, 화면의 실제 생김새는 UI kit이 기준이다.

## 4. 기술 스택

### 4.1 모바일 앱

모바일 앱은 React Native 기반으로 구현한다.

권장 스택:

- Runtime / framework: Expo
- Language: TypeScript
- Navigation: React Navigation
- Server state: TanStack Query
- HTTP client: Axios
- Client state: Zustand
- Local storage: MMKV 우선, 필요 시 AsyncStorage
- Icons: `lucide-react-native`
- SVG: `react-native-svg`, `react-native-svg-transformer`
- Animation: React Native `Animated` 또는 Reanimated

Expo를 기본 선택으로 둔다. MVP 속도, 폰트/이미지 자산 관리, 테스트 편의성이 좋기 때문이다. 네이티브 제약이 명확해질 때만 Expo prebuild 또는 React Native CLI를 검토한다.

### 4.2 웹

웹 버전도 함께 만든다.

권장 스택:

- Framework: React + TypeScript
- Build tool: Vite
- Server state: TanStack Query
- HTTP client: Axios
- Client state: Zustand
- Icons: `lucide-react`
- Styling: 기존 `ui_kits/web/styles.css`의 토큰과 규칙을 재현할 수 있는 방식

웹과 모바일은 무리하게 동일 컴포넌트 파일을 공유하지 않아도 된다. 대신 화면 구조, 토큰, 카피, 에셋, API 타입, 도메인 모델은 최대한 공유한다.

## 5. 디자인 복제 원칙

구현 결과는 디자인 원본과 최대한 같아야 한다.

확인해야 할 항목:

- 화면별 레이아웃
- 상하좌우 여백
- 카드 크기와 radius
- 버튼 높이와 radius
- 텍스트 크기와 굵기
- 캐릭터 이미지 위치와 크기
- 말풍선 형태
- 탭바 위치와 아이콘 스타일
- 색상 토큰
- 그림자와 elevation
- 빈 상태, 에러 상태, 토스트
- 화면 전환 흐름
- pressed/hover/focus 상태

디자인 원본과 다르게 보이는 구현은 기능이 동작하더라도 완료로 보지 않는다.

## 6. 디자인 토큰

토큰은 아래 파일을 기준으로 한다.

- 모바일/RN 호환 토큰: `ui_kits/mobile/tokens.js`
- 웹 CSS 토큰: `colors_and_type.css`
- 웹 구현 스타일: `ui_kits/web/styles.css`

기본 테마는 Latte다. Mint와 Cloud는 확장 가능한 선택지로 유지한다.

주요 규칙:

- 기본 배경: Latte `bg1`
- 카드 배경: `bg2`
- 주요 액션: `primary`
- 보조 강조: `accent`
- 카드 radius: 20
- 버튼 radius: 16
- 모바일 기본 좌우 여백: 24
- 본문 폰트: Pretendard
- 디스플레이 폰트: SUIT
- 캐릭터 말풍선/감성 포인트: Gaegu
- 아이콘은 lucide 계열 우선

React Native에서는 `ThemeProvider`와 `useTheme` 훅을 만들어 현재 테마 토큰을 주입한다. 컴포넌트 내부에서 임의 컬러를 직접 만들지 않는다.

웹에서는 `colors_and_type.css`와 `ui_kits/web/styles.css`의 변수, spacing, radius, shadow 체계를 우선 따른다.

## 7. 자산 사용

캐릭터와 브랜드 자산은 `assets/`에 있는 파일을 사용한다.

주요 자산:

- `assets/character-nova.png`
- `assets/character-nova-happy.png`
- `assets/character-nova-sleepy.png`
- `assets/character-mumu.png`
- `assets/character-mumu-happy.png`
- `assets/character-mumu-sleepy.png`
- `assets/character-jjori.png`
- `assets/character-jjori-happy.png`
- `assets/character-jjori-sleepy.png`
- `assets/logo-wordmark.svg`
- `assets/logomark.svg`
- `assets/pattern-stardust.svg`

임의의 새 캐릭터 이미지나 대체 일러스트를 만들지 않는다. 필요한 상태 이미지가 없으면 기존 에셋 중 가장 가까운 것을 사용하고, 누락 여부를 작업 결과에 명시한다.

## 8. MVP 구현 범위

우선 MVP 핵심 플로우를 구현한다.

MVP 우선순위:

1. Google 로그인 진입 화면
2. 캐릭터 선택
3. 캐릭터 이름 설정
4. 온보딩 설문
5. 홈
6. 현재 미션 1개 제안
7. 미션 거절 후 다음 미션 제안
8. 미션 완료 질문 1개
9. 미션 완료 결과와 별조각 보상
10. 캐릭터 상세 / 돌봄
11. 상점
12. 인벤토리
13. 마이페이지

MVP 외 기능은 화면 구조를 막지 않는 선에서만 준비한다. 실제 결제, 구독, 가챠, 파티/채팅/리그, 사진 AI 판독, 지도 기반 인증, 레벨업 외형 진화는 구현하지 않는다.

## 9. 화면 구현 기준

화면은 화면 설계서의 SCR ID와 UI kit 화면을 함께 기준으로 구현한다.

주요 화면:

- `SCR-002` Google 로그인
- `SCR-003` 캐릭터 선택
- `SCR-004` 캐릭터 이름 설정
- `SCR-005` 온보딩 설문
- `SCR-006` 홈
- `SCR-007` 미션 카드
- `SCR-009` 미션 완료 질문
- `SCR-010` 미션 완료 결과
- `SCR-012` 캐릭터 상세 / 돌봄
- `SCR-013` 상점
- `SCR-014` 인벤토리
- `SCR-021` 마이페이지

화면을 구현할 때는 먼저 UI kit에서 같은 화면의 구조를 찾고, 그 구조를 실제 앱 코드로 옮긴다.

## 10. 제품 경험과 카피

Polaris는 "해야 할 일 관리 앱"이 아니라 "작은 일상을 같이 살아주는 캐릭터 앱"이다.

카피 원칙:

- 조곤조곤하고 따뜻한 존댓말
- 캐릭터가 말하는 듯한 짧은 문장
- 부담 없는 제안
- 작은 행동을 인정하는 표현
- 실패/오류/빈 상태도 차갑지 않게 표현

피해야 할 표현:

- 외로운 사람을 위한 서비스
- 무기력한 사람 치료 서비스
- 자기관리 실패자를 위한 앱
- 생활 교정 서비스

카피도 UI kit과 문서에 있는 표현을 우선 사용한다. 새 문구를 만들 때는 기존 톤에서 벗어나지 않는다.

## 11. API 연동 규칙

API 명세는 `docs/api/01-API-spec.md`를 따른다.

공통 응답은 `ApiResponse<T>`로 감싼다.

```ts
type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error: ApiError | null;
};

type ApiError = {
  timestamp: string;
  status: number;
  code: string;
  message: string;
  path: string;
  retryAfterSeconds?: number;
};
```

API 클라이언트 지침:

- Axios 인스턴스를 도메인 공통 클라이언트로 만든다.
- 인증 토큰은 요청 인터셉터에서 붙인다.
- 서버 상태는 TanStack Query로 관리한다.
- 로그인 세션, 선택 테마, 앱 설정 같은 클라이언트 상태는 Zustand에 둔다.
- 화면 내부 임시 상태만 `useState`로 둔다.
- 중복 보상/구매/돌봄/출석 같은 API는 멱등성 키를 반드시 고려한다.
- 서버 오류 문구가 너무 기술적이면 사용자 노출 문구는 Polaris 톤으로 다듬는다.

멱등성 키 위치는 API마다 다를 수 있으므로 이름만 보고 임의로 처리하지 않는다.

- 캐릭터 돌봄 액션 `POST /api/character/v1/characters/{characterId}/care-logs`는 요청 헤더 `Idempotency-Key`를 사용한다.
- 공유 이벤트 `POST /api/share/v1/share-events`는 request body의 `idempotencyKey`를 사용한다.
- 다른 동시성 민감 API는 `docs/api/01-API-spec.md`의 해당 endpoint 상세를 확인해 header인지 body인지 맞춘다.
- `DUPLICATED_IDEMPOTENCY_KEY` 응답은 중복 요청으로 처리하고, 사용자에게 같은 보상을 또 지급된 것처럼 표시하지 않는다.

커서 페이지네이션 구현 규칙:

- 상점 `GET /api/item/v1/items`, 인벤토리 `GET /api/item/v1/user-items`, 알림 `GET /api/notification/v1/notifications`는 cursor 기반 목록으로 구현한다.
- 요청에는 `cursor`와 `size`를 사용한다. 첫 요청의 `cursor`는 `null` 또는 생략 가능한 명세인지 endpoint별로 확인한다.
- 응답의 `pageInfo.nextCursor`와 `pageInfo.hasNext`를 기준으로 다음 페이지를 요청한다.
- 무한 스크롤/더보기 구현 시 같은 cursor로 중복 요청하지 않도록 loading 상태를 잠근다.
- 새로고침 시 cursor 목록을 초기화하고 첫 페이지부터 다시 조회한다.

공유 카드 구현 규칙:

- 공유 카드 플로우는 `컴포넌트 렌더링 -> 이미지 캡처 -> presigned-url 발급 -> R2/S3로 PUT 업로드 -> share-card 생성 -> share-event 기록` 순서로 구현한다.
- 이미지 캡처 라이브러리는 웹에서 `html2canvas` 또는 `dom-to-image`, React Native에서 `react-native-view-shot`을 우선 검토한다.
- presigned URL은 `GET /api/share/v1/presigned-url`로 발급받는다.
- 프론트엔드는 발급받은 `presignedUrl`에 이미지 파일을 HTTP `PUT`으로 직접 업로드한다.
- 업로드 완료 후 서버가 내려준 공개 `imageUrl`을 사용해 `POST /api/share/v1/share-cards`를 호출한다.
- 사용자가 실제 공유 버튼을 눌렀을 때 `POST /api/share/v1/share-events`를 호출하고, body에 `idempotencyKey`를 포함한다.
- 공유 카드 캡처 이미지 권장 크기는 1200 x 630px이다.
- `og:image`로 쓰이는 이미지 URL은 반드시 `https://...` 형태의 절대 URL이어야 한다.
- 공유 링크 미리보기용 OG 태그는 프론트 SPA에서 동적으로 처리하지 않는다. `og:title`, `og:description`, `og:image`, `og:url`은 서버가 공유 링크 HTML의 `head`에 렌더링해야 한다.
- 프론트는 공유 링크 화면 UI를 구현할 수 있지만, 메신저/소셜 미리보기 보장을 위해 OG 메타 태그 책임을 가져오지 않는다.

## 12. 권장 폴더 구조

모바일 앱 예시:

```text
src/
  app/
    App.tsx
    providers/
  assets/
  components/
    common/
    character/
    mission/
  features/
    auth/
    onboarding/
    home/
    mission/
    character/
    shop/
    inventory/
    mypage/
  navigation/
  services/
    api/
    query/
  stores/
  theme/
    tokens.ts
    ThemeProvider.tsx
    useTheme.ts
  types/
  utils/
```

웹 앱 예시:

```text
src/
  app/
  assets/
  components/
  features/
  routes/
  services/
  stores/
  theme/
  types/
  utils/
```

기능 단위 코드가 커지면 `features/{domain}` 안에 `api`, `components`, `hooks`, `types`, `screens`를 둔다.

## 13. 컴포넌트 작성 규칙

- TypeScript를 사용한다.
- `any`는 피한다.
- API 응답 타입을 명시한다.
- 공통 컴포넌트는 실제로 2회 이상 사용될 때 분리한다.
- 도메인 의미가 있는 컴포넌트 이름을 사용한다.
- Pressable 버튼은 pressed 상태를 제공한다.
- 터치 영역은 모바일에서 충분히 크게 둔다.
- 접근성 라벨을 넣을 수 있는 버튼/이미지에는 `accessibilityLabel`을 제공한다.
- 텍스트 입력은 글자 수 제한, 에러 문구, 비활성 상태를 함께 고려한다.
- 캐릭터 이름 입력은 1~10자 제한을 적용한다. 빈 값, 공백만 있는 값, 10자를 초과한 값은 제출하지 않는다.
- 컴포넌트 스타일은 디자인 원본의 spacing/radius/color/shadow를 따른다.

## 14. 바이브코딩 작업 규칙

AI 코딩 에이전트는 구현 전에 항상 디자인 원본을 먼저 확인한다.

작업 순서:

1. 요청과 관련된 UI kit 화면을 확인한다.
2. 관련 PRD/API/화면 설계를 확인한다.
3. 디자인 원본의 레이아웃, 토큰, 컴포넌트 구조를 파악한다.
4. MVP 범위 안에서 가장 작은 동작 단위로 구현한다.
5. 로딩, 에러, 빈 상태를 함께 처리한다.
6. 모바일과 웹 중 영향을 받는 쪽을 명확히 구분한다.
7. 구현 후 실제 화면을 실행해 디자인 원본과 비교한다.
8. 타입 체크, 린트, 테스트 또는 실행 확인을 한다.
9. 확인하지 못한 부분은 최종 응답에 명시한다.

AI 에이전트가 임의로 하지 말아야 할 것:

- UI kit과 다른 새 디자인 만들기
- MVP 범위를 넘는 대형 기능을 먼저 만들기
- 디자인 토큰을 무시하고 새 팔레트를 만들기
- API 명세와 다른 endpoint를 임의로 만들기
- 실제 결제/구독/가챠 플로우를 구현하기
- 사용자 감정을 낙인찍는 카피 추가하기
- 필요 이상의 전역 상태 만들기
- 한 화면 구현 중 관련 없는 리팩터링을 크게 섞기

## 15. 검증 기준

모바일 앱:

- `ui_kits/mobile/index.html`의 화면과 최대한 동일하게 보여야 한다.
- Android 기준 화면 깨짐을 우선 확인한다.
- 작은 화면에서 버튼 텍스트와 카드 텍스트가 넘치지 않아야 한다.
- 캐릭터 이미지가 누락되거나 찌그러지지 않아야 한다.
- 주요 MVP 플로우를 실제 기기 또는 시뮬레이터에서 이동할 수 있어야 한다.

웹:

- `ui_kits/web/index.html`의 화면과 최대한 동일하게 보여야 한다.
- 모바일 폭과 데스크톱 폭을 모두 확인한다.
- 주요 MVP 플로우를 브라우저에서 이동할 수 있어야 한다.

공통:

- TypeScript 오류가 없어야 한다.
- API 실패 상태를 확인한다.
- 로딩 상태를 확인한다.
- 빈 상태를 확인한다.
- 인증 필요 화면의 비로그인 진입 처리를 확인한다.
- 구현 완료 후 디자인 원본과 다른 부분이 있으면 명확히 기록한다.

## 16. 결정된 기본 방향

- 이 저장소는 디자인 기준 프로젝트다.
- 구현 결과는 기존 모바일/웹 디자인과 최대한 같아야 한다.
- 모바일 앱은 Expo 기반 React Native + TypeScript를 기본으로 한다.
- 웹은 React + TypeScript + Vite를 기본으로 한다.
- 상태 관리는 TanStack Query + Zustand 조합을 기본으로 한다.
- 디자인 토큰은 기존 Polaris 토큰을 source of truth로 삼는다.
- 우선 구현 범위는 MVP 핵심 플로우로 제한한다.
