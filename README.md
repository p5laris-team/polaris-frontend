# Polaris Frontend

Polaris는 사용자가 고른 별친구 캐릭터와 함께 작은 루틴 미션을 수행하는 AI 다마고치형 루틴 서비스입니다. 이 저장소는 Polaris의 프론트엔드 앱, 디자인 기준 문서, UI kit, 이미지 에셋을 함께 관리합니다.

현재 실제 앱 구현은 `apps/web`의 React + TypeScript + Vite 웹앱입니다. `docs`, `ui_kits`, `preview`는 구현 기준과 초기 시안을 확인하기 위한 자료입니다.

## Quickstart

처음 실행할 때는 백엔드 없이도 화면을 볼 수 있는 fixture 모드가 가장 편합니다.

```bash
cd /Users/corapark/Documents/p5laris/polaris-frontend

corepack enable
corepack prepare pnpm@9.15.0 --activate

pnpm install
cp apps/web/.env.example apps/web/.env.local
pnpm dev:web
```

개발 서버 기본 주소는 `http://127.0.0.1:5173`입니다.

`corepack`을 사용할 수 없는 환경에서는 아래처럼 pnpm을 직접 설치해도 됩니다.

```bash
npm install -g pnpm@9.15.0
```

## 실제 API 연결

기본 fixture 모드는 `VITE_USE_API_FIXTURES=true`라서 API 서버가 없어도 동작합니다. 백엔드와 붙여 볼 때는 `apps/web/.env.local`을 아래처럼 바꿉니다.

```env
VITE_USE_API_FIXTURES=false
VITE_API_BASE_URL=http://127.0.0.1:8080
VITE_OAUTH_REDIRECT_URI=http://127.0.0.1:5173/oauth/google/callback
```

`polaris` 백엔드를 쓰면 gateway 기본 포트가 `8080`입니다. `p5laris-local` 백엔드를 같이 띄운 경우에는 local gateway 포트에 맞춰 `VITE_API_BASE_URL=http://127.0.0.1:18080`처럼 바꾸면 됩니다.

환경 변수를 바꾼 뒤에는 Vite dev server를 껐다가 다시 켜 주세요.

## Scripts

| 명령어 | 설명 |
|---|---|
| `pnpm dev:web` | 웹앱 개발 서버를 실행합니다. |
| `pnpm build:web` | TypeScript 검사 후 production bundle을 만듭니다. |
| `pnpm preview:web` | production build 결과를 로컬에서 미리 봅니다. |
| `pnpm typecheck:web` | TypeScript 타입 검사만 실행합니다. |

## 저장소 구조

```text
.
├── apps/web/              # 실제 React + Vite 웹앱
├── assets/                # 로고, 캐릭터, 카테고리, 아이템 이미지
├── docs/                  # PRD, API 명세, 화면 설계, 디자인 문서
├── fonts/                 # 폰트 로딩/자체 호스팅 가이드
├── preview/               # 디자인 토큰/컴포넌트 HTML 프리뷰
├── ui_kits/               # 초기 웹/모바일 클릭스루 프로토타입
├── colors_and_type.css    # 공통 디자인 토큰
├── AGENTS.md              # 구현 기준과 AI 작업 지침
├── package.json           # pnpm workspace scripts
└── pnpm-workspace.yaml    # pnpm workspace 설정
```

## 웹앱 구조

`apps/web/src`는 화면 단위로 고치기 쉽게 나눠져 있습니다.

```text
apps/web/src/
├── app/                   # 앱 조립부: 초기화, provider, 최상위 App
├── routes/                # URL 경로와 라우팅
├── entities/              # 여러 feature가 공유하는 도메인 타입
├── features/              # 실제 화면/기능 단위 코드
├── shared/                # 공통 API, 설정, 스타일, UI 컴포넌트
├── stores/                # 전역 클라이언트 상태
└── main.tsx               # React 앱 진입점
```

`features` 안의 각 기능은 보통 같은 모양을 따릅니다.

```text
features/mission/
├── api/                   # 실제 API 호출, React Query hook, query key
├── model/                 # fixture, mapper, store, 화면 계산 로직
└── ui/                    # 화면 컴포넌트와 CSS
```

이 구조 덕분에 “미션 화면을 고친다”면 대부분 `features/mission`부터 보면 되고, “공통 버튼을 고친다”면 `shared/ui/Button`을 보면 됩니다.

## 코드 주석 읽는 법

프론트 코드의 주석은 팀원이 빠르게 구조를 이해하고, 포트폴리오에서 기술 판단을 설명할 수 있게 남겨 둡니다.

| 주석 위치 | 의미 |
|---|---|
| 파일 맨 위 block 주석 | 이 파일이 프로그램에서 맡는 책임입니다. 처음 보는 파일이면 이 주석부터 읽으면 됩니다. |
| exported function/hook 주석 | 다른 파일에서 호출할 수 있는 함수가 언제, 왜 쓰이는지 설명합니다. |
| type/enum 주석 | 백엔드 상태값이나 요청/응답 필드가 제품에서 무슨 뜻인지 설명합니다. |
| 한 줄 주석 | 인증, 동시성, 캐시 무효화, 멱등성, fallback처럼 코드만 봐서는 이유가 덜 보이는 부분에 붙입니다. |
| `SCR-xxx` 주석 | PR 번호가 아니라 `docs/product/07-Screen-Design-Specification.md`의 화면 ID입니다. 화면 명세와 구현을 연결하기 위한 표시입니다. |

개인 작업명, PR 번호, “나중에 대충” 같은 메모는 코드에 남기지 않습니다. 필요하면 README나 이슈에 작업 맥락으로 정리하고, 코드에는 제품/기술 기준으로 설명합니다.

## 어디를 고칠까

| 고치고 싶은 것 | 먼저 볼 파일 |
|---|---|
| 로그인 버튼, OAuth callback | `features/auth/ui`, `features/auth/api/authApi.ts`, `stores/authStore.ts` |
| 로그인 후 첫 화면 이동 | `app/providers/AppInitializer.tsx`, `routes/AppRouter.tsx` |
| 홈 캐릭터/미션 카드 | `features/home/ui/HomePage.tsx`, `features/home/model/homeMappers.ts` |
| 미션 거절/다음 미션/완료 인증 | `features/mission/api/missionApi.ts`, `features/mission/ui` |
| 미션 상태값 의미 | `entities/mission/types.ts` |
| 캐릭터 상태/돌봄 | `features/character/ui/CharacterCarePage.tsx`, `features/character/model/characterCareTypes.ts` |
| 캐릭터 이미지가 다르게 나올 때 | `features/character/model/characterAssetResolver.ts`, `shared/assets/polarisAssets.ts` |
| 상점 상품/구매 | `features/shop/ui/ShopPage.tsx`, `features/shop/api/shopApi.ts` |
| 보관함/스킨 장착 | `features/inventory/ui/InventoryPage.tsx`, `features/inventory/api/inventoryApi.ts` |
| 별조각 거래내역 | `features/wallet/ui/WalletPage.tsx`, `features/wallet/model/walletTypes.ts` |
| 공유 카드/공유 보상 | `features/share/ui/ShareCardPage.tsx`, `features/share/api/shareApi.ts` |
| 출석 체크 | `features/attendance/ui/AttendancePage.tsx`, `features/attendance/api/attendanceApi.ts` |
| 알림 목록/읽음 처리 | `features/notifications/ui/NotificationsPage.tsx`, `features/notifications/api/notificationApi.ts` |
| 마이페이지/알림 설정 | `features/my-page/ui/MyPage.tsx`, `features/my-page/model/myPageSettingsStore.ts` |
| 버튼, 카드, 헤더 같은 공통 UI | `shared/ui` |

## 핵심 흐름

앱 시작 흐름은 아래 순서입니다.

```text
main.tsx
→ AppProviders
→ App
→ AppInitializer
→ AppRouter
→ 각 feature page
```

`AppProviders`는 React Query, React Router, ToastProvider처럼 앱 전체에 필요한 provider를 묶습니다.

`AppInitializer`는 로그인 토큰이 있을 때 온보딩 프로필과 활성 캐릭터를 먼저 조회해서 새로고침 후에도 사용자를 올바른 화면으로 보내기 위한 초기화 계층입니다.

`AppRouter`는 로그인, 온보딩, 홈, 미션, 캐릭터, 상점, 인벤토리, 지갑, 공유, 출석, 알림, 마이페이지 라우트를 관리합니다. fixture 모드에서는 실제 로그인 없이도 화면 흐름을 확인할 수 있습니다.

## API와 상태 관리

서버 상태는 TanStack Query를 사용합니다. API 호출과 query key는 각 feature의 `api` 폴더에 둡니다.

클라이언트 상태는 Zustand를 사용합니다. 로그인 세션은 `stores/authStore.ts`, 온보딩 진행 상태는 `features/onboarding/model/onboardingStore.ts`에 있습니다.

HTTP 공통 처리는 `shared/api/httpClient.ts`에 있습니다.

여기서 신경 쓴 부분:

| 항목 | 설명 |
|---|---|
| 공통 응답 unwrap | 백엔드의 `ApiResponse<T>`를 `unwrapApiResponse`로 풀어 화면에서는 성공 데이터만 다루게 했습니다. |
| 토큰 자동 첨부 | Axios request interceptor에서 access token을 붙입니다. |
| 선제적 토큰 갱신 | access token 만료 30초 전이면 refresh token으로 먼저 갱신합니다. |
| 401 재시도 | 응답이 401이면 한 번만 token refresh 후 원래 요청을 재시도합니다. |
| refresh 중복 방지 | 동시에 여러 요청이 401을 만나도 `refreshPromise` 하나를 공유해 token refresh 요청이 중복으로 나가지 않게 했습니다. |
| fixture 전환 | `VITE_USE_API_FIXTURES` 값 하나로 실제 API와 fixture 데이터를 바꿔 탈 수 있습니다. |
| query invalidation | 미션 완료, 거절, 구매, 출석처럼 데이터가 바뀌는 mutation 후 관련 query를 다시 불러오게 했습니다. |

## 디자인 기준

화면 디자인은 새로 해석하지 않고 기존 UI kit과 디자인 문서를 기준으로 맞춥니다.

먼저 볼 파일:

| 상황 | 먼저 볼 곳 |
|---|---|
| 화면 생김새가 헷갈릴 때 | `ui_kits/web/index.html`, `ui_kits/web/styles.css` |
| 모바일 기준까지 확인할 때 | `ui_kits/mobile/index.html` |
| 제품 의도와 화면 목록을 볼 때 | `docs/product/PRD.md`, `docs/product/07-Screen-Design-Specification.md` |
| API request/response를 볼 때 | `docs/api/01-API-spec.md` |
| 색상/폰트/토큰을 볼 때 | `colors_and_type.css`, `docs/design/00-design-system.md` |
| 에셋 파일명을 찾을 때 | `assets/`, `shared/assets/polarisAssets.ts` |

Polaris의 톤은 “해야 할 일 관리 앱”보다 “작은 일상을 같이 살아주는 캐릭터 앱”에 가깝습니다. 그래서 에러, 빈 상태, 버튼 문구도 너무 딱딱하지 않게 유지합니다.

## 자주 고치는 방법

### 새 페이지를 추가할 때

1. `features/{기능명}/ui`에 페이지 컴포넌트를 만듭니다.
2. 필요한 API가 있으면 `features/{기능명}/api`에 API 함수와 hook을 만듭니다.
3. fixture가 필요하면 `features/{기능명}/model`에 `*Fixtures.ts`를 둡니다.
4. `routes/paths.ts`에 URL을 추가합니다.
5. `routes/AppRouter.tsx`에 `<Route />`를 추가합니다.
6. 하단 탭에 들어갈 화면이면 `features/navigation`도 같이 수정합니다.

### API endpoint를 붙일 때

1. `docs/api/01-API-spec.md`에서 endpoint와 응답 타입을 확인합니다.
2. 여러 feature에서 공유할 타입이면 `entities`에 둡니다.
3. 특정 화면 전용 타입이면 해당 feature의 `model`에 둡니다.
4. `shared/api`에서 export되는 `apiClient`와 `unwrapApiResponse`를 사용합니다.
5. fixture 모드에서도 같은 화면 흐름이 되도록 fixture 함수를 같이 만듭니다.

### 화면 스타일을 고칠 때

1. 먼저 `colors_and_type.css`의 토큰을 확인합니다.
2. 특정 화면 CSS는 해당 feature의 `ui/*.css`에서 수정합니다.
3. 여러 화면이 같이 쓰는 컴포넌트는 `shared/ui`에서 수정합니다.
4. 임의 색상, 임의 radius, 임의 그림자를 만들기 전에 UI kit에 같은 패턴이 있는지 확인합니다.

### 로그인/인증 쪽을 고칠 때

1. OAuth 진입과 callback은 `features/auth`를 봅니다.
2. access token과 refresh token 보관은 `stores/authStore.ts`를 봅니다.
3. 토큰 첨부와 재발급은 `shared/api/httpClient.ts`를 봅니다.
4. 로그인 여부에 따른 라우팅은 `routes/AppRouter.tsx`의 `ProtectedRoute`와 `RootRedirect`를 봅니다.

### 미션 흐름을 고칠 때

1. 미션 조회/생성/거절/완료 API는 `features/mission/api/missionApi.ts`를 봅니다.
2. 현재 미션 카드와 홈 요약은 `features/home`도 함께 봅니다.
3. 답변 페이지는 `MissionAnswerPage.tsx`, 결과 페이지는 `MissionResultPage.tsx`입니다.
4. 거절 후 다음 미션 요청은 하나의 mutation 안에서 순서를 보장합니다.

### 캐릭터/아이템 이미지가 안 맞을 때

1. 실제 이미지 파일은 `assets/`에 있습니다.
2. 웹에서 쓰는 asset 경로 매핑은 `shared/assets/polarisAssets.ts`를 봅니다.
3. 캐릭터 상태별 이미지 선택은 `features/character/model/characterAssetResolver.ts`를 봅니다.
4. 아이템 이미지는 `features/item/model/itemAssetResolver.ts`를 봅니다.

## 신경 쓴 내용

이 프로젝트는 화면만 얹은 코드가 아니라 실제 운영을 생각해 아래 부분을 챙겼습니다.

| 영역 | 신경 쓴 내용 |
|---|---|
| API 전환성 | 백엔드가 준비되기 전에는 fixture로 개발하고, 준비되면 환경 변수로 실제 API를 연결합니다. |
| 인증 안정성 | access token 만료 전 갱신과 401 후 재시도를 모두 처리합니다. |
| 동시성 | token refresh 요청이 동시에 여러 번 나가지 않도록 공유 Promise로 묶었습니다. |
| 서버 상태 | TanStack Query query key와 invalidation으로 화면 데이터가 오래된 상태로 남지 않게 했습니다. |
| 도메인 분리 | feature별로 `api/model/ui`를 나눠 어디를 고칠지 찾기 쉽게 했습니다. |
| 디자인 일관성 | `colors_and_type.css`, UI kit, `shared/ui` 컴포넌트를 기준으로 화면 톤을 맞췄습니다. |
| 개발 편의성 | fixture 모드, 디자인 시스템 preview, path alias를 둬 백엔드 없이도 화면을 빠르게 확인할 수 있습니다. |
| 운영 확장성 | Sentry 같은 프론트 모니터링을 붙일 수 있도록 release/env/source map 기준으로 확장하기 쉬운 Vite 구조입니다. |
| 주석 기준 | 파일 책임, 타입/enum 의미, 동시성/정합성 판단을 한국어 주석으로 남겨 팀원이 빠르게 따라올 수 있게 했습니다. |

## 대용량/운영 확장 포인트

지금은 MVP 규모에 맞춰 단순하게 구현했지만, 데이터가 커지면 아래 순서로 확장하면 됩니다.

| 영역 | 확장 방향 |
|---|---|
| 목록 데이터 | 알림, 지갑, 상점, 보관함은 이미 cursor page 타입을 사용합니다. 실제 무한 스크롤이 필요해지면 `useInfiniteQuery`로 바꾸면 됩니다. |
| 렌더링 성능 | 알림/거래내역이 수백 건 이상으로 늘면 `react-virtual` 같은 가상 리스트를 붙여 DOM 개수를 줄입니다. |
| API 부하 | 홈처럼 자주 보는 데이터는 `staleTime`을 조정하고, mutation 후 필요한 query만 invalidation합니다. |
| 인증 동시성 | refresh token 요청은 공유 Promise로 묶어 여러 API가 동시에 401을 받아도 재발급 요청이 한 번만 나가게 했습니다. |
| 보상 중복 방지 | 공유 보상은 `idempotencyKey`를 보내 같은 공유 카드로 보상이 중복 지급되지 않게 설계했습니다. |
| 이미지 트래픽 | 캐릭터/스킨 이미지가 늘면 CDN URL과 로컬 fallback을 같이 유지하고, 필요한 화면에서만 preload를 붙입니다. |
| 모니터링 | 운영 배포 후에는 Sentry release/env/source map 설정으로 프론트 에러와 사용자 영향도를 추적합니다. |

## 운영 전 체크리스트

배포 전에 최소한 아래를 확인합니다.

```bash
pnpm typecheck:web
pnpm build:web
pnpm preview:web
```

운영 환경에서는 fixture를 반드시 끕니다.

```env
VITE_USE_API_FIXTURES=false
VITE_API_BASE_URL=https://api.example.com
```

나중에 Sentry를 붙이면 아래를 같이 챙깁니다.

| 항목 | 이유 |
|---|---|
| `environment` | production/staging/local 에러를 분리하기 위해 필요합니다. |
| `release` | 어떤 배포 버전부터 에러가 생겼는지 추적하기 위해 필요합니다. |
| source map upload | minified JS 에러를 실제 TypeScript 파일/라인으로 보기 위해 필요합니다. |
| 민감정보 필터링 | token, email, 입력값 같은 개인정보가 외부로 나가지 않게 하기 위해 필요합니다. |
| 낮은 sampling | 무료 quota와 사용자 프라이버시를 지키기 위해 필요합니다. |

## 문제 해결

### 화면이 로그인으로만 이동할 때

`VITE_USE_API_FIXTURES=false`이면 실제 로그인 세션이 없을 때 `/login`으로 이동합니다. 백엔드 없이 화면을 보고 싶으면 fixture 모드를 켭니다.

```env
VITE_USE_API_FIXTURES=true
```

### API 호출이 전부 실패할 때

`VITE_API_BASE_URL`이 현재 gateway 포트와 맞는지 확인합니다.

```env
# polaris 백엔드
VITE_API_BASE_URL=http://127.0.0.1:8080

# p5laris-local 백엔드
VITE_API_BASE_URL=http://127.0.0.1:18080
```

### 새 환경 변수가 반영되지 않을 때

Vite는 dev server 시작 시 환경 변수를 읽습니다. `.env.local`을 바꿨다면 `pnpm dev:web`을 다시 실행합니다.

### 이미지 import가 안 될 때

`@polaris-assets` alias는 `apps/web/vite.config.ts`와 `apps/web/tsconfig.json`에 같이 등록되어 있습니다. alias를 바꾸면 두 파일을 함께 수정해야 합니다.

## 문서 인덱스

| 영역 | 문서 |
|---|---|
| 제품 기준 | `docs/product/PRD.md` |
| 화면 설계 | `docs/product/07-Screen-Design-Specification.md` |
| API 명세 | `docs/api/01-API-spec.md` |
| 디자인 시스템 | `docs/design/00-design-system.md` |
| UI/UX 에셋 | `docs/design/08-UIUX-Asset-Production-Guide.md` |
| 구현 기준 | `AGENTS.md` |
