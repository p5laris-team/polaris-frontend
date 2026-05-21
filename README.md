# Polaris Frontend

Polaris는 사용자가 고른 별친구 캐릭터와 함께 작은 루틴 미션을 수행하는 AI 다마고치형 루틴 서비스입니다. 이 저장소는 Polaris의 프런트엔드 구현과 디자인 기준 문서를 함께 관리합니다.

현재 실제 앱 구현은 `apps/web`의 React + TypeScript + Vite 웹앱입니다. 초기 디자인 시스템과 클릭스루 프로토타입은 `docs/design`, `ui_kits`, `preview`에 남겨 두었습니다.

---

## Quickstart

```bash
cd /Users/corapark/Documents/p5laris/polaris-frontend

# pnpm이 없다면 먼저 활성화합니다.
corepack enable
corepack prepare pnpm@9.15.0 --activate

# corepack을 사용할 수 없는 환경에서는 아래 대안을 사용합니다.
# npm install -g pnpm@9.15.0

pnpm install
pnpm dev:web
```

개발 서버 기본 주소는 Vite 기본값인 `http://127.0.0.1:5173`입니다.

---

## Environment

웹앱 환경 변수는 Vite 규칙에 따라 `apps/web/.env.local`에 둡니다. 기본값은 fixture 모드라서 백엔드 없이 화면 흐름을 확인할 수 있습니다.

```bash
cp apps/web/.env.example apps/web/.env.local
```

| 변수 | 기본값 | 설명 |
|---|---|---|
| `VITE_USE_API_FIXTURES` | `true` | `false`로 설정하면 실제 API를 호출합니다. |
| `VITE_API_BASE_URL` | 빈 문자열 | 실제 API 모드에서 gateway origin을 지정합니다. |
| `VITE_OAUTH_REDIRECT_URI` | 현재 origin의 `/oauth/google/callback` | Google OAuth redirect URI입니다. |

---

## Scripts

| 명령어 | 설명 |
|---|---|
| `pnpm dev:web` | 웹앱 개발 서버 실행 |
| `pnpm build:web` | TypeScript 검사 후 Vite 빌드 |
| `pnpm preview:web` | 빌드 결과 미리보기 |
| `pnpm typecheck:web` | 타입 검사만 실행 |

---

## Project Structure

```text
.
├── apps/web/              # React + Vite 웹앱
├── assets/                # 로고, 캐릭터, 카테고리, 아이템 이미지
├── docs/                  # PRD, API 명세, 화면 설계, 디자인 문서
├── fonts/                 # 폰트 로딩/자체 호스팅 가이드
├── preview/               # 디자인 토큰/컴포넌트 HTML 프리뷰
├── ui_kits/               # 초기 웹/모바일 클릭스루 프로토타입
├── colors_and_type.css    # 공통 디자인 토큰
├── AGENTS.md              # 구현 기준과 AI 작업 지침
├── package.json           # pnpm workspace scripts
└── pnpm-workspace.yaml
```

---

## Documents

문서 진입점은 `docs/README.md`입니다.

| 영역 | 문서 |
|---|---|
| 제품 기준 | `docs/product/PRD.md` |
| 화면 설계 | `docs/product/07-Screen-Design-Specification.md` |
| API 명세 | `docs/api/01-API-spec.md` |
| 디자인 시스템 | `docs/design/00-design-system.md` |
| UI/UX 에셋 | `docs/design/08-UIUX-Asset-Production-Guide.md` |

구현 중 화면 기준이 헷갈리면 `ui_kits`와 `AGENTS.md`를 먼저 확인합니다. API 호출 형태는 `docs/api/01-API-spec.md`를 기준으로 맞춥니다.
