# Polaris Frontend Docs

이 디렉터리는 제품 기준, API 계약, 화면 설계, 디자인/에셋 문서를 역할별로 나눠 관리합니다.

## Structure

```text
docs/
├── api/       # REST API 계약
├── product/   # PRD와 화면 설계
└── design/    # 디자인 시스템, UI/UX 에셋 제작 가이드
```

## Product

| 문서 | 역할 |
|---|---|
| [PRD.md](./product/PRD.md) | Polaris MVP 제품 요구사항 |
| [07-Screen-Design-Specification.md](./product/07-Screen-Design-Specification.md) | MVP 화면 목록, 화면별 동작, 라우팅/컴포넌트 기준 |

## API

| 문서 | 역할 |
|---|---|
| [01-API-spec.md](./api/01-API-spec.md) | REST API endpoint, request/response, 인증/멱등성 정책 |

## Design

| 문서 | 역할 |
|---|---|
| [00-design-system.md](./design/00-design-system.md) | 브랜드 컨셉, 콘텐츠 원칙, 컬러/타입/아이콘 기준 |
| [08-UIUX-Asset-Production-Guide.md](./design/08-UIUX-Asset-Production-Guide.md) | 에셋 제작 우선순위와 하위 문서 인덱스 |
| [uiux-assets/](./design/uiux-assets/) | 캐릭터, 스킨, 모션, 이스터에그, 제작 백로그, 파일 규격 |

## Related Roots

| 경로 | 역할 |
|---|---|
| [../AGENTS.md](../AGENTS.md) | 구현 기준과 AI 작업 지침 |
| [../colors_and_type.css](../colors_and_type.css) | 공통 디자인 토큰 |
| [../assets/](../assets/) | 앱에서 사용하는 브랜드/캐릭터/카테고리/아이템 에셋 |
| [../ui_kits/](../ui_kits/) | 초기 웹/모바일 클릭스루 프로토타입 |
| [../preview/](../preview/) | 디자인 시스템 HTML 프리뷰 |
