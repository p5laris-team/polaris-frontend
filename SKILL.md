---
name: polaris-design
description: Use this skill to generate well-branded interfaces and assets for Polaris, an AI Tamagotchi-style routine companion service. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping web (React) and mobile (React Native, Android-first) surfaces.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files (`colors_and_type.css`, `assets/`, `preview/`, `ui_kits/web/`, `ui_kits/mobile/`).

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. The UI kits in `ui_kits/web/` and `ui_kits/mobile/` are React + Babel inline prototypes — read their components and screens for ready-made building blocks (CharacterStage, MissionCard, BottomTabs, ProgressRing, etc.).

If working on production code, you can copy assets and read the rules in `README.md` to become an expert in designing with this brand:

- Brand concept: Polaris is an AI 다마고치형 루틴 컴패니언 — users care for a 별친구 character (별이/구름이/콩이) by completing daily missions.
- Tone: 존댓말, 따뜻하고 차분, 캐릭터가 1인칭으로 말 거는 발화 패턴.
- Visuals: 따뜻한 크림(Latte) 기본 + Mint / Cloud 두 대안 테마. Light/Dark 모두 지원. 둥근 모서리(카드 20px, 버튼 16px), Toss-스타일 넉넉한 여백, Pretendard/SUIT 한글 폰트, 미세한 별가루 패턴, 커스텀 일러스트 + Lucide 아이콘 혼용.
- 7 core screens: 로그인 · 캐릭터 선택 · 온보딩 설문 · 홈 · 미션 목록 · 캐릭터 상세/돌봄 · 상점/인벤토리.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions (target surface, screen, variations needed), and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.
