# Polaris Frontend ✨

<p align="center">
  <img src="assets/brand/logo/logo-wordmark.png" width="260" alt="Polaris">
</p>

<p align="center">
  <strong>AI 별친구와 함께 작은 루틴을 이어가는 모바일 웹 프론트엔드 🌙</strong>
</p>

<p align="center">
  <a href="https://p5laris.life/">서비스 바로가기</a>
  ·
  <a href="docs/product/PRD.md">PRD</a>
  ·
  <a href="docs/api/01-API-spec.md">API 명세</a>
  ·
  <a href="docs/design/00-design-system.md">디자인 시스템</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=111827" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/TanStack_Query-5-FF4154?style=flat-square&logo=reactquery&logoColor=white" alt="TanStack Query">
  <img src="https://img.shields.io/badge/Zustand-5-443E38?style=flat-square" alt="Zustand">
  <img src="https://img.shields.io/badge/pnpm-9.15-F69220?style=flat-square&logo=pnpm&logoColor=white" alt="pnpm">
</p>

---

## 📌 프로젝트 소개

Polaris는 사용자가 직접 거창한 목표를 세우지 않아도, AI 캐릭터인 별친구가 오늘 할 수 있는 작은 미션을 제안하고 완료 경험을 별조각, 성장, 대화 기록으로 이어주는 루틴 서비스입니다.

이 저장소는 Polaris의 프론트엔드 영역을 담당합니다. 실제 앱은 `apps/web`의 React + TypeScript + Vite 웹앱이며, 모바일 앱처럼 보이는 420px 기준 shell, 디자인 시스템, 에셋 레지스트리, API 연동 계층, fixture 기반 개발 환경을 함께 관리합니다.

## 🧩 프론트엔드에서 구현한 것

| 영역 | 구현 내용 |
|---|---|
| 📱 모바일 웹앱 shell | PWA 메타/manifest, 420px 모바일 앱 프레임, 하단 탭 내비게이션, 화면별 skeleton/error/empty 상태 |
| 🔐 인증과 초기화 | Google OAuth callback, access/refresh token 저장, 만료 전 refresh, 401 재시도, 로그인 후 온보딩/홈 라우팅 |
| 🎯 AI 미션 흐름 | 현재 미션 조회, 다음 미션 요청, 거절, 완료 질문 시작, 답변 제출, 결과 화면, 미션 상세/기록/피드백 |
| 💬 별친구 대화 | `fetch` stream reader 기반 SSE 수신, `meta`/`delta`/`done` 이벤트 처리, 세션 기반 오늘 대화 복원, 기억 일기 조회 |
| 🌱 캐릭터와 돌봄 | 캐릭터 선택, 상태/성장 표시, 돌봄 액션, 스킨 장착, 상태별 캐릭터 이미지 resolver |
| 💎 별조각 경제 | 지갑 거래내역, 상점 상품 조회/구매, 인벤토리, 아이템 사용, 캐시 무효화 |
| 📨 공유와 출석 | 공유 카드 렌더링, Presigned URL 업로드, 공유 보상 멱등키, 출석 체크와 연속 출석 배너 |
| 🔔 알림과 운영 | FCM registration token 저장, 알림 목록/읽음 처리, Sentry release/env/source map 기반 확장 |
| 📣 광고 슬롯 | 하단 웹 배너 config API, AdSense real request guard, 키보드 노출 정책, 승인 전 임시 비활성화 지점 관리 |
| 🎨 디자인 시스템 | SUIT/Pretendard/Gaegu/JetBrains Mono, 색상/간격/radius/shadow 토큰, UI kit/preview와 실제 컴포넌트 정합성 |

## 🛠 기술적으로 신경 쓴 부분

| 주제 | 프론트엔드 판단 |
|---|---|
| API 전환성 | `VITE_USE_API_FIXTURES` 하나로 fixture와 실제 API를 전환해 백엔드 없이도 화면 흐름을 검증합니다. |
| 서버 상태 관리 | TanStack Query의 query key와 mutation invalidation을 기능별 API 계층에 모아 오래된 화면 데이터를 줄였습니다. |
| 인증 안정성 | access token 만료 30초 전 선제 갱신, 401 1회 재시도, refresh 요청 공유 Promise로 중복 갱신을 막았습니다. |
| SSE 실시간성 | 캐릭터 대화는 `EventSource` 대신 인증 header를 실을 수 있는 `fetch` stream reader로 구현했습니다. |
| 도메인 분리 | `features/{domain}/api`, `model`, `ui` 구조로 API, 화면 계산, 컴포넌트를 분리했습니다. |
| 이미지 관리 | 화면에서 파일 경로를 직접 흩뿌리지 않고 `shared/assets/polarisAssets.ts` 레지스트리로 관리합니다. |
| 모바일 UX | 키보드 표시, 하단 탭, 고정 앱 shell, safe-area, 긴 텍스트 줄바꿈을 고려해 모바일 화면 흔들림을 줄였습니다. |
| 운영 관측성 | Sentry 설정, 민감 header 제거, source map upload 가능 구조를 준비했습니다. |

## 🗂 앱 구조

```text
apps/web/src/
├── app/                   # AppProviders, AppInitializer, 최상위 App 조립
├── routes/                # route path, ProtectedRoute, RootRedirect
├── entities/              # 여러 feature가 공유하는 도메인 타입
├── features/              # 화면과 기능 단위 코드
│   ├── auth/              # 로그인, OAuth callback
│   ├── home/              # 홈 캐릭터/현재 미션 카드
│   ├── mission/           # 미션 조회, 거절, 완료, 상세, 기록
│   ├── character/         # 캐릭터 상태, 돌봄, SSE 대화, 기억 일기
│   ├── shop/              # 상점 상품과 구매
│   ├── inventory/         # 보관함과 스킨 장착
│   ├── wallet/            # 별조각 잔액과 거래내역
│   ├── share/             # 공유 카드와 공개 공유 페이지
│   ├── attendance/        # 출석 체크
│   ├── notifications/     # FCM token, 알림 목록/읽음
│   ├── my-page/           # 마이페이지와 사용자 설정
│   └── ad/                # 하단 배너 광고 config와 AdSense 슬롯
├── shared/                # 공통 API, config, assets, styles, UI
├── stores/                # 전역 클라이언트 상태
└── main.tsx               # React 앱 진입점
```

앱 시작 흐름은 아래 순서입니다.

```text
main.tsx
-> AppProviders
-> App
-> AppInitializer
-> AppRouter
-> feature page
```

## 📁 저장소 구성

```text
.
├── apps/web/              # 실제 React + Vite 웹앱
├── assets/                # 로고, 캐릭터, 카테고리, 아이템, empty state 이미지
├── docs/                  # PRD, API 명세, 화면 설계, 디자인 문서
├── fonts/                 # 자체 호스팅 폰트
├── preview/               # 디자인 토큰/컴포넌트 HTML 프리뷰
├── ui_kits/               # 초기 웹/모바일 클릭스루 프로토타입
├── colors_and_type.css    # 공통 디자인 토큰과 폰트 로딩
├── AGENTS.md              # 구현 기준과 협업 지침
├── package.json           # pnpm workspace scripts
└── pnpm-workspace.yaml    # pnpm workspace 설정
```

## 🚀 빠른 실행

처음 화면을 확인할 때는 백엔드 없이 fixture 모드로 실행하는 편이 가장 빠릅니다.

```powershell
cd C:\Users\phj\Documents\p5laris\polaris-frontend

corepack enable
corepack prepare pnpm@9.15.0 --activate
corepack pnpm install
```

`apps/web/.env.local`을 아래처럼 준비합니다.

```env
VITE_USE_API_FIXTURES=true
VITE_API_BASE_URL=http://127.0.0.1:8080
VITE_OAUTH_REDIRECT_URI=http://127.0.0.1:5173/oauth/google/callback
VITE_WEB_PUSH_ENABLED=false
VITE_SENTRY_ENABLED=false
```

개발 서버를 실행합니다.

```powershell
corepack pnpm --filter @polaris/web dev
```

기본 주소는 `http://127.0.0.1:5173`입니다.

## 🔌 실제 API 연결

운영 레포의 gateway와 붙일 때는 fixture를 끄고 API base URL을 gateway 주소로 맞춥니다.

```env
VITE_USE_API_FIXTURES=false
VITE_API_BASE_URL=http://127.0.0.1:8080
VITE_OAUTH_REDIRECT_URI=http://127.0.0.1:5173/oauth/google/callback
```

`p5laris-local` gateway를 같이 쓰는 환경이면 포트에 맞춰 `VITE_API_BASE_URL=http://127.0.0.1:18080`처럼 바꿉니다. Vite는 서버 시작 시 환경 변수를 읽으므로 `.env.local`을 바꾼 뒤에는 dev server를 다시 켭니다.

## ⚙️ 명령어

pnpm shim이 PATH에 잡혀 있으면 `pnpm dev:web`처럼 package script를 써도 됩니다. Windows에서 bare `pnpm`이 잡히지 않으면 아래처럼 `corepack pnpm --filter`를 직접 실행합니다.

| 목적 | 권장 명령 |
|---|---|
| 개발 서버 | `corepack pnpm --filter @polaris/web dev` |
| 타입 검사 | `corepack pnpm --filter @polaris/web typecheck` |
| 프로덕션 빌드 | `corepack pnpm --filter @polaris/web build` |
| 빌드 결과 미리보기 | `corepack pnpm --filter @polaris/web preview` |

## 🧭 주요 화면과 코드 위치

| 화면/기능 | 먼저 볼 파일 |
|---|---|
| 로그인, OAuth callback | `apps/web/src/features/auth/ui`, `apps/web/src/features/auth/api/authApi.ts` |
| 로그인 후 초기 라우팅 | `apps/web/src/app/providers/AppInitializer.tsx`, `apps/web/src/routes/AppRouter.tsx` |
| 홈 캐릭터와 현재 미션 | `apps/web/src/features/home/ui/HomePage.tsx`, `apps/web/src/features/mission/api/missionApi.ts` |
| 미션 거절/완료/상세 | `apps/web/src/features/mission/ui`, `apps/web/src/entities/mission/types.ts` |
| 별친구 SSE 대화 | `apps/web/src/features/character/ui/CharacterTalkCard.tsx`, `apps/web/src/features/character/api/characterTalkApi.ts` |
| 캐릭터 상태와 돌봄 | `apps/web/src/features/character/ui/CharacterCarePage.tsx`, `apps/web/src/features/character/api/characterCareApi.ts` |
| 캐릭터 이미지 선택 | `apps/web/src/features/character/model/characterAssetResolver.ts`, `apps/web/src/shared/assets/polarisAssets.ts` |
| 상점/보관함/스킨 | `apps/web/src/features/shop`, `apps/web/src/features/inventory` |
| 별조각 지갑 | `apps/web/src/features/wallet` |
| 공유 카드 | `apps/web/src/features/share` |
| 출석 체크 | `apps/web/src/features/attendance` |
| 알림/FCM | `apps/web/src/features/notifications`, `apps/web/public/firebase-messaging-sw.js` |
| 공통 버튼/카드/헤더 | `apps/web/src/shared/ui` |

## 🧠 API와 상태 관리 규칙

서버 상태는 TanStack Query를 사용하며, API 함수와 query key는 각 feature의 `api` 폴더에 둡니다.

클라이언트 상태는 Zustand를 사용합니다. 로그인 세션은 `stores/authStore.ts`, 온보딩 진행 상태는 `features/onboarding/model/onboardingStore.ts`, 미션 완료 플로우 임시 상태는 `features/mission/model/missionFlowStore.ts`에 있습니다.

공통 HTTP 처리는 `shared/api/httpClient.ts`가 담당합니다.

| 처리 | 설명 |
|---|---|
| 응답 unwrap | 백엔드의 `ApiResponse<T>`를 `unwrapApiResponse`로 풀어 화면에서는 성공 데이터만 다룹니다. |
| 인증 header | Axios request interceptor가 access token을 자동 첨부합니다. |
| 선제 refresh | access token 만료가 가까우면 API 호출 전에 갱신합니다. |
| 401 retry | 401 응답은 refresh 후 원래 요청을 한 번만 재시도합니다. |
| 중복 refresh 방지 | 동시에 여러 요청이 401을 만나도 하나의 refresh Promise를 공유합니다. |
| fixture 전환 | `runtimeConfig.useApiFixtures`로 실제 API와 fixture를 같은 화면 흐름에서 바꿉니다. |

## 🌊 SSE 대화 흐름

별친구 대화는 인증이 필요한 POST 요청이므로 브라우저 `EventSource` 대신 `fetch` stream을 사용합니다.

```text
CharacterTalkCard
-> streamCharacterTalk()
-> fetch('/api/character/v1/characters/{id}/talk/stream')
-> ReadableStream reader
-> SSE frame parsing
-> meta / delta / done handlers
-> 대화 버블 즉시 갱신
```

`delta` 이벤트는 들어오는 즉시 누적 텍스트로 화면에 반영합니다. 서버가 실제로 chunk를 잘게 내려주면 사용자는 실시간으로 타이핑되는 것처럼 보고, 서버가 큰 chunk를 내려주면 프론트가 그 단위를 그대로 보여줍니다.

## 🎨 디자인과 에셋

Polaris의 프론트 톤은 할 일 관리 도구보다 "작은 일상을 같이 살아주는 캐릭터 앱"에 가깝습니다. 그래서 버튼, empty state, 에러 문구도 기능 설명보다 감정 흐름을 해치지 않는 방향으로 작성합니다.

| 기준 | 위치 |
|---|---|
| 제품 의도 | `docs/product/PRD.md` |
| 화면 설계 | `docs/product/07-Screen-Design-Specification.md` |
| 디자인 시스템 | `docs/design/00-design-system.md` |
| 토큰/폰트 | `colors_and_type.css` |
| 웹 UI kit | `ui_kits/web/index.html`, `ui_kits/web/styles.css` |
| 모바일 UI kit | `ui_kits/mobile/index.html` |
| 이미지 원본 | `assets/` |
| 웹 에셋 registry | `apps/web/src/shared/assets/polarisAssets.ts` |

## ✅ 운영 전 체크리스트

배포 전 최소 확인 항목입니다.

```powershell
corepack pnpm --filter @polaris/web typecheck
corepack pnpm --filter @polaris/web build
corepack pnpm --filter @polaris/web preview
```

운영 환경에서는 fixture를 반드시 끕니다.

```env
VITE_USE_API_FIXTURES=false
VITE_API_BASE_URL=https://api.example.com
VITE_APP_ENV=production
```

Sentry를 활성화할 때는 release, environment, source map upload, 민감정보 필터링을 함께 확인합니다.

## 🧯 문제 해결

### 🔐 화면이 로그인으로만 이동할 때

`VITE_USE_API_FIXTURES=false`이면 실제 로그인 세션이 없을 때 `/login`으로 이동합니다. 백엔드 없이 화면을 확인하려면 fixture 모드를 켭니다.

```env
VITE_USE_API_FIXTURES=true
```

### 🌐 API 호출이 전부 실패할 때

`VITE_API_BASE_URL`이 현재 gateway 포트와 맞는지 확인합니다.

```env
# polaris gateway
VITE_API_BASE_URL=http://127.0.0.1:8080

# p5laris-local gateway
VITE_API_BASE_URL=http://127.0.0.1:18080
```

### ♻️ 새 환경 변수가 반영되지 않을 때

Vite는 dev server 시작 시 환경 변수를 읽습니다. `.env.local`을 바꿨다면 dev server를 껐다가 다시 실행합니다.

### 🖼 이미지 import가 안 될 때

`@polaris-assets` alias는 `apps/web/vite.config.ts`와 `apps/web/tsconfig.json`에 함께 등록되어 있습니다. alias를 바꾸면 두 파일을 같이 수정해야 합니다.

## 📚 문서 인덱스

| 영역 | 문서 |
|---|---|
| 제품 기준 | `docs/product/PRD.md` |
| 화면 설계 | `docs/product/07-Screen-Design-Specification.md` |
| API 명세 | `docs/api/01-API-spec.md` |
| 디자인 시스템 | `docs/design/00-design-system.md` |
| UI/UX 에셋 | `docs/design/08-UIUX-Asset-Production-Guide.md` |
| 에셋 관리 | `assets/README.md` |
| 구현 기준 | `AGENTS.md` |
