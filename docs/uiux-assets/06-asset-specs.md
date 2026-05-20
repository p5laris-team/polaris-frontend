# 06. 파일 네이밍/규격

[상위 문서로 돌아가기](../08-UIUX-Asset-Production-Guide.md)

---

## 목차

1. [공통 규격](#1-공통-규격)
2. [파일 네이밍](#2-파일-네이밍)
3. [이미지 사이즈](#3-이미지-사이즈)
4. [애니메이션 규격](#4-애니메이션-규격)
5. [전달 폴더 구조](#5-전달-폴더-구조)
6. [QA 체크리스트](#6-qa-체크리스트)

---

## 1. 공통 규격

| 항목 | 기준 |
|---|---|
| 배경 | 캐릭터/스킨 원본은 투명 배경 권장 |
| 색공간 | sRGB |
| 파일명 | 영문 소문자, kebab-case |
| 확장자 | PNG 우선, 웹 최적화 시 WebP 검토 |
| 원본 | 가능하면 2x 이상 원본 유지 |
| 라이선스 | 외부 상용 소재 사용 시 출처/권리 기록 |

---

## 2. 파일 네이밍

캐릭터:

```text
character-{characterKey}-{state}.png
```

예시:

```text
character-mumu-idle.png
character-mumu-happy.png
character-mumu-sleepy.png
```

스킨:

```text
skin-{skinKey}-{characterKey}-{state}.png
skin-{skinKey}-thumbnail.png
```

예시:

```text
skin-starlight-mumu-idle.png
skin-starlight-nova-happy.png
skin-starlight-thumbnail.png
```

상태/행동:

```text
motion-{characterKey}-{action}.json
effect-{effectName}.png
```

예시:

```text
motion-mumu-care-feed.json
effect-star-particle.png
```

---

## 3. 이미지 사이즈

| 용도 | 권장 사이즈 | 비고 |
|---|---:|---|
| 홈 캐릭터 | 512x512 | 투명 배경 |
| 미션 완료 캐릭터 | 768x768 | happy 우선 |
| 공유 카드 캐릭터 | 1024x1024 이상 | 카드 중앙 확대 대응 |
| 상점 썸네일 | 512x512 | 2열 카드 대응 |
| 보관함 썸네일 | 512x512 | 장착 상태 표시 |
| 빈 상태 일러스트 | 720x480 | 모바일 카드형 영역 |
| 공유 카드 최종 이미지 | 1080x1350 | 4:5 비율 |

---

## 4. 애니메이션 규격

CSS 애니메이션:

- duration: 300~1400ms
- easing: ease-out 계열
- 반복 모션은 2초 이상 간격
- transform/opacity 위주 사용

Lottie/Rive 검토 시:

- 1개 파일 150KB 이하 목표
- 반복 재생 여부 명시
- reduced motion 정지 프레임 제공
- 같은 모션을 3캐릭터에 재활용할 수 있는지 확인

---

## 5. 전달 폴더 구조

권장 전달 구조:

```text
assets/
  characters/
    nova/
    mumu/
    jjori/
  skins/
    starlight/
    dawn/
    night-sky/
  effects/
  empty-states/
  share-cards/
```

프론트 반영 시 현재 앱 경로:

```text
assets/
apps/web/src/shared/assets/
```

실제 앱 번들에서는 `shared/assets/polarisAssets.ts`에서 import 경로를 관리한다.

---

## 6. QA 체크리스트

- [ ] 파일명이 kebab-case이며 캐릭터/스킨 key가 API 코드와 매칭된다.
- [ ] 320px 모바일 폭에서 주요 실루엣이 보인다.
- [ ] 배경색이 달라도 캐릭터 외곽선이 묻히지 않는다.
- [ ] 이미지 용량이 앱 로딩에 부담되지 않는다.
- [ ] 같은 에셋이 홈/상점/보관함/공유 카드에서 비율 깨짐 없이 보인다.
- [ ] reduced motion 환경에서 대체 정지 프레임이 있다.
- [ ] 새 스킨 추가 시 상점, 보관함, 공유 카드 사용처가 모두 확인된다.

