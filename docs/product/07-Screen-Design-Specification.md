# 07. 화면 설계서 (Screen Design Specification)

## 문서 정보

| 항목 | 내용 |
|------|------|
| 문서명 | Polaris MVP 화면 설계서 |
| 작성일 | 2026-05-14 |
| 버전 | v1.0 |
| 참조 문서 | PRD v0.6, 유스케이스 명세서, REST API 명세서 v1.0, 프로토타입 v0.4 |
| 상태 | Draft |
| 작성자 | Backend Architecture Team |

> UI/UX 에셋 제작 항목은 [08. UI/UX 에셋 제작 가이드](../design/08-UIUX-Asset-Production-Guide.md)를 기준으로 별도 관리한다.

---

## 목차

1. [화면 구성 개요](#1-화면-구성-개요)
2. [화면 목록 요약표](#2-화면-목록-요약표)
3. [화면별 상세 설계](#3-화면별-상세-설계)
    - [SCR-001 랜딩 (삭제)](#scr-001-랜딩-삭제)
    - [SCR-002 Google 로그인 (진입 화면)](#scr-002-google-로그인-진입-화면)
    - [SCR-003 캐릭터 선택](#scr-003-캐릭터-선택)
    - [SCR-004 캐릭터 이름 설정](#scr-004-캐릭터-이름-설정)
    - [SCR-005 온보딩 설문](#scr-005-온보딩-설문)
    - [SCR-006 홈](#scr-006-홈)
    - [SCR-007 미션 카드](#scr-007-미션-카드)
    - [SCR-008 미션 거절 (삭제/보류)](#scr-008-미션-거절-삭제보류)
    - [SCR-009 미션 완료 질문](#scr-009-미션-완료-질문)
    - [SCR-010 미션 완료 결과](#scr-010-미션-완료-결과)
    - [SCR-011 미션 히스토리](#scr-011-미션-히스토리)
    - [SCR-012 캐릭터 상세 / 돌봄](#scr-012-캐릭터-상세--돌봄)
    - [SCR-013 상점](#scr-013-상점)
    - [SCR-014 인벤토리](#scr-014-인벤토리)
    - [SCR-015 별조각 내역](#scr-015-별조각-내역)
    - [SCR-016 캐릭터 카드 공유](#scr-016-캐릭터-카드-공유)
    - [SCR-017 공유 링크 랜딩 (외부 유입)](#scr-017-공유-링크-랜딩-외부-유입)
    - [SCR-018 업적 (MVP 제외/보류)](#scr-018-업적-mvp-제외보류)
    - [SCR-019 출석 체크](#scr-019-출석-체크)
    - [SCR-020 알림함](#scr-020-알림함)
    - [SCR-021 마이페이지](#scr-021-마이페이지)
4. [네비게이션 구조](#4-네비게이션-구조)
5. [공통 UI 컴포넌트](#5-공통-ui-컴포넌트)
6. [화면 전환 흐름](#6-화면-전환-흐름)

---

## 1. 화면 구성 개요

### 1.1 화면 분류

| 분류 | 설명 | 화면 수 |
|------|------|--------|
| 온보딩 | 최초 진입 ~ 첫 미션 도달까지 | 4개 (랜딩 화면 제외) |
| 핵심 루프 | 미션 제안·완료·거절 핵심 플로우 | 4개 (거절 사유 화면 제외) |
| 캐릭터 | 캐릭터 상태·돌봄 | 1개 |
| 경제 | 상점·인벤토리·별조각 | 3개 |
| 바이럴 | 카드 공유·외부 유입 | 2개 |
| 부가 기능 | 출석·알림·마이페이지 | 3개 |
| 보류/제외 | 업적 | 1개 |
| **합계(MVP 구현 대상)** | | **18개** |

### 1.2 설계 원칙

```
1. 미션 1개 집중 — 리스트 나열 금지. 현재 미션 1개를 캐릭터 대화형으로 제안
2. 캐릭터 말투 일관성 — 노바/무무/쪼리 각각 다른 말투로 모든 화면에 녹아남
3. API는 `docs/api/01-API-spec.md`의 최신 `/api/{domain}/v1/...` 명세를 기준으로 한다
4. 거절 → 다음 미션 즉시 — 별도 사유 입력 없이 즉시 거절 API를 호출하고 다음 미션으로 전환 (하루 최대 15개)
5. 공유 유입 추적 — 공유 링크 클릭 시 referral / UTM 파라미터 추적
```

---

## 2. 화면 목록 요약표

| 화면 ID | 화면 이름 | 관련 UC | 주요 기능                                  | 호출 API |
|---------|---------|---------|----------------------------------------|---------|
| SCR-002 | Google 로그인 | UC-001 | Google 소셜 로그인 진입 및 인증, 신규/기존 분기 | `GET /api/auth/v1/google/authorization-url`, `POST /api/auth/v1/google/sessions` |
| SCR-003 | 캐릭터 선택 | UC-002 | 3종 캐릭터 소개 및 선택                         | `GET /api/character/v1/character-types` |
| SCR-004 | 캐릭터 이름 설정 | UC-003 | 캐릭터 닉네임 입력, 캐릭터 생성                     | `POST /api/character/v1/characters` |
| SCR-005 | 온보딩 설문 | UC-004 | 7문항 설문 진행, 개인화 프로필 저장                  | `GET /api/onboarding/v1/questions`, `GET /api/onboarding/v1/profiles/me`, `PUT /api/onboarding/v1/profiles/me` |
| SCR-006 | 홈 | UC-006, UC-010, UC-020 | 캐릭터·미션 카드·별조각·상태 요약                | `GET /api/home/v1/home` |
| SCR-007 | 미션 카드 | UC-006, UC-007, UC-008 | 미션 1개 제안, 완료/거절 선택                     | `GET /api/mission/v1/missions/current`, `POST /api/mission/v1/missions/{missionId}/completion-sessions`, `POST /api/mission/v1/missions/{missionId}/rejections`, `POST /api/mission/v1/missions/today-focus/next` |
| SCR-009 | 미션 완료 질문 | UC-008, UC-009 | 캐릭터 질문 1개, 텍스트 답변 입력                   | `POST /api/mission/v1/missions/{missionId}/completion-sessions`, `POST /api/mission/v1/missions/{missionId}/completion-answers` |
| SCR-010 | 미션 완료 결과 | UC-009, UC-021 | 별조각 지급 애니메이션, 캐릭터 반응         | `POST /api/mission/v1/missions/{missionId}/completion-answers`, `GET /api/wallet/v1/wallets/me` |
| SCR-011 | 미션 히스토리 | UC-006 | 오늘 제안/거절/완료 미션 스택 조회, 진행 중 미션 바로 수행 | `GET /api/mission/v1/missions/today`, `POST /api/mission/v1/missions/{missionId}/completion-sessions` |
| SCR-012 | 캐릭터 상세 / 돌봄 | UC-010, UC-011, UC-012, UC-013 | 캐릭터 상태 3개 확인, 보유 소모품으로 밥 주기/재우기/놀아주기 | `GET /api/character/v1/characters/me`, `GET /api/character/v1/characters/{characterId}/status`, `GET /api/item/v1/user-items?itemType=CONSUMABLE`, `POST /api/character/v1/characters/{characterId}/care-logs` |
| SCR-013 | 상점 | UC-015, UC-016, UC-017, UC-023 | 현재 캐릭터용 스킨과 돌봄 소모품 조회, 별조각으로 구매 | `GET /api/item/v1/items`, `POST /api/item/v1/item-purchases`, `GET /api/wallet/v1/wallets/me` |
| SCR-014 | 인벤토리 | UC-018, UC-019 | 보유 스킨 조회, 스킨 장착/해제                     | `GET /api/item/v1/user-items`, `PUT /api/character/v1/characters/{characterId}/equipped-skin` |
| SCR-015 | 별조각 내역 | UC-020 | 별조각 잔액 조회, 획득/사용 트랜잭션 목록               | `GET /api/wallet/v1/wallets/me`, `GET /api/wallet/v1/wallets/me/transactions` |
| SCR-016 | 캐릭터 카드 공유 | UC-025, UC-026, UC-022 | 공유 카드 생성(멘트 지정), SNS 공유, 보상 여부 조회/지급 | `GET /api/share/v1/presigned-url`, `POST /api/share/v1/share-cards`, `POST /api/share/v1/share-events`, `GET /api/share/v1/share-events/today` |
| SCR-017 | 공유 링크 랜딩 | UC-027 | 외부 공유 링크 진입 화면, 카드 정보 로드 및 클릭 로그 자동 적재 | `GET /api/share/v1/share-links/{shareId}` |
| SCR-018 | 업적 | UC-029, UC-030 | MVP 제외/보류. 화면 구현 대상 아님 | API 미제공 |
| SCR-019 | 출석 체크 | UC-028 | 오늘 출석 체크, 출석 달력 조회                     | `POST /api/attendance/v1/attendance-records`, `GET /api/attendance/v1/attendance-records` |
| SCR-020 | 알림함 | UC-031 | 앱 내 알림 목록 조회, 알림 읽음 처리       | `GET /api/notification/v1/notifications`, `PATCH /api/notification/v1/notifications/{notificationId}` |
| SCR-021 | 마이페이지 | UC-031 | 내 정보 조회, 알림 로컬 설정, 로그아웃                | `GET /api/user/v1/users/me`, `DELETE /api/auth/v1/sessions/current` |

---

## 3. 화면별 상세 설계

---

### SCR-001 랜딩 (삭제/보류)

본 화면은 사용자 UX 단순화를 위해 **삭제**되었으며, 앱 진입 즉시 `SCR-002 Google 로그인` 화면으로 통합되었습니다.

---

### SCR-002 Google 로그인 (진입 화면)

| 항목 | 내용 |
|------|------|
| **화면 ID** | SCR-002 |
| **화면 이름** | Google 로그인 |
| **진입 경로** | 앱 최초 접속 (비로그인 상태) |
| **관련 UC** | UC-001 |
| **호출 API** | `GET /api/auth/v1/google/authorization-url`, `POST /api/auth/v1/google/sessions` |

#### 화면 구성

```
[상단]
- Polaris 로고 + 서비스 슬로건
  "오늘 한 게 없다고? 무무는 봤는데."

[중앙]
- Google 소셜 로그인 인증 영역 (Google 로고가 포함된 커스텀 버튼)
- [Google 계정으로 시작하기] 버튼
- 버튼 클릭 시: Google OAuth2 인증 팝업/리다이렉트 기동 및 로그인 진행 로딩 스피너 표시

[하단]
- 서비스 이용약관 및 개인정보처리방침 안내 링크 (회색 소형 텍스트)
```

#### 로그인 완료 후 분기 조건

| 상태 | 이동 화면 |
|------|---------|
| 비로그인 / 실패 | SCR-002 (로그인 유지) |
| 로그인 성공 + 신규 가입 (온보딩 미완) | SCR-003 (캐릭터 선택) |
| 로그인 성공 + 기존 유저 (온보딩 완료) | SCR-006 (홈) |
| 로그인 성공 + 기존 유저 (온보딩 중단) | 설문 중단 단계 화면으로 복귀 |

#### 에러 처리

| 에러 | 표시 방식 |
|------|---------|
| 인증 취소 | 토스트: "로그인이 취소됐어요. 다시 시도해볼게요?" |
| 네트워크 오류 | 토스트: "연결이 불안정해요. 잠시 후 다시 시도해주세요." |

---

### SCR-003 캐릭터 선택

| 항목 | 내용 |
|------|------|
| **화면 ID** | SCR-003 |
| **화면 이름** | 캐릭터 선택 |
| **진입 경로** | SCR-002 신규 가입 완료 후 |
| **관련 UC** | UC-002 |
| **호출 API** | `GET /api/character/v1/character-types` |

#### 화면 구성

```
[상단]
- 안내 문구: "오늘부터 같이할 친구를 골라봐!"
- 진행 표시: 온보딩 1/4

[중단]
- 캐릭터 카드 3종 (가로 스와이프 or 나란히 배치)
  각 카드 구성:
  ├── 캐릭터 썸네일 이미지 (THUMBNAIL 에셋)
  ├── 캐릭터 이름 (노바 / 무무 / 쪼리)
  ├── 한 줄 소개 (summary)
  ├── 성격 키워드 태그 2~3개
  └── 샘플 대사 (sample_line)

[하단]
- [이 친구로 할게요] 선택 확정 버튼 → SCR-004
- 선택 전: 버튼 비활성화
```

#### 캐릭터 데이터

| 코드 | 이름 | 성격 | 말투 |
|------|------|------|------|
| `nova` | 노바 | 밝고 긍정적, 응원형 | 따뜻하고 활기찬 말투 |
| `mumu` | 무무 | 느긋하고 귀여운 공감형 | 짧고 밈스러운 말투 |
| `jjori` | 쪼리 | 솔직하고 직설적인 현실파 | 툭툭 내뱉는 말투 |

---

### SCR-004 캐릭터 이름 설정

| 항목 | 내용 |
|------|------|
| **화면 ID** | SCR-004 |
| **화면 이름** | 캐릭터 이름 설정 |
| **진입 경로** | SCR-003 캐릭터 선택 완료 후 |
| **관련 UC** | UC-003 |
| **호출 API** | `POST /api/character/v1/characters` |

#### 화면 구성

```
[상단]
- 선택한 캐릭터 이미지 (BASE 에셋)
- 안내 문구: "친구 이름을 지어줘봐!"
- 진행 표시: 온보딩 2/4

[중단]
- 텍스트 입력창
  - placeholder: 예) 뭉개구름, 하루, 콩이
  - 최대 10자
  - 실시간 글자 수 표시
  - 입력 시 캐릭터 말풍선에 실시간 반응

[하단]
- [이름 정했어요] 버튼 → SCR-005
- 버튼 활성 조건: 1자 이상 입력
```

#### 유효성 검사

| 조건 | 처리 |
|------|------|
| 0자 | 버튼 비활성화 |
| 11자 이상 | 입력 차단 (최대 10자) |
| 부적절한 단어 | 토스트 경고 후 입력창 초기화 |

---

### SCR-005 온보딩 설문

| 항목 | 내용 |
|------|------|
| **화면 ID** | SCR-005 |
| **화면 이름** | 온보딩 설문 |
| **진입 경로** | SCR-004 캐릭터 이름 설정 완료 후 |
| **관련 UC** | UC-004 |
| **호출 API** | `GET /api/onboarding/v1/questions`, `GET /api/onboarding/v1/profiles/me`, `PUT /api/onboarding/v1/profiles/me` |

#### 화면 구성

```
[상단]
- 진행 바 (현재 문항 / 7)
- 캐릭터 이미지 + 말풍선 (캐릭터 말투로 질문 전달)

[중단]
- 질문 텍스트
- 선택지 버튼 (라디오 선택형, 문항별 3~5개)

[하단]
- [다음] 버튼 (선택 완료 시 활성화)
- [이전] 버튼 (2문항 이후)
- 마지막 7문항: [완료] 버튼 → SCR-006 (홈)
```

#### 7문항 구성 (DB `onboarding_profiles` 테이블 완전 일치)

| 문항 | 내용 | 대응 필드 |
|------|------|----------|
| Q1 | 주로 어디서 생활하나요? | `living_type` |
| Q2 | 보통 몇 시에 일어나나요? | `wake_up_time` |
| Q3 | 보통 몇 시에 자나요? | `sleep_time` |
| Q4 | 미션은 주로 언제 받고 싶나요? | `preferred_mission_time` |
| Q5 | 지금 가장 만들고 싶은 루틴은? | `routine_goal` |
| Q6 | 실내/실외 활동 중 어느 쪽이 편한가요? | `activity_preference` |
| Q7 | 미션은 어느 정도 강도가 좋은가요? | `mission_intensity` |

#### 중단 복귀 처리

설문 미완료 상태로 앱 재진입 시 `GET /api/onboarding/v1/profiles/me`로 진행 상태를 확인하고, 저장된 답변 기준으로 다음 문항부터 복귀한다.

---

### SCR-006 홈

| 항목 | 내용 |
|------|------|
| **화면 ID** | SCR-006 |
| **화면 이름** | 홈 |
| **진입 경로** | 온보딩 완료 후 / 앱 재방문 시 |
| **관련 UC** | UC-006, UC-010, UC-020 |
| **호출 API** | `GET /api/home/v1/home` |

#### 화면 구성

```
[상단 영역]
- 별조각 아이콘 버튼 → SCR-015
- 알림 아이콘 → SCR-020

[캐릭터 영역]
- 캐릭터 이미지 (상태·장착 스킨 반영)
  - 상태 우선순위: 애정 BAD > 기운 BAD > 포만감 BAD > NORMAL > GOOD
- 캐릭터 이름
- 오늘의 캐릭터 한마디 (캐릭터 말투 반영)
- 캐릭터 하단에는 포만감/기운/애정/별조각/알림 숫자 요약을 노출하지 않음

[미션 카드 영역]
- 현재 미션 1개 (SCR-007로 이어짐)
  - 캐릭터 말풍선 형태
  - 미션 제목
  - 예상 소요 시간 / 난이도 / 보상 별조각 배지
  - [해냈어요] 완료 버튼 → SCR-009
  - [다른 미션 볼게요] 거절 버튼 ➔ 거절 API 즉시 호출 및 다음 미션 갱신 (SCR-008 제거)
- 미션 없음 상태: "오늘 미션은 다 봤어요. 내일 또 와요!" 문구

[하단 퀵 메뉴]
- 상점 / 인벤토리 / 공유 아이콘 버튼 3개
- 오늘 완료 미션 수 요약

```

#### 상태 표시 변환

| 내부 필드 | 화면 표현 | 임계치 |
|----------|----------|--------|
| `hunger` 낮음 | "배가 고파요" | < 30 |
| `energy` 낮음 | "너무 피곤해요 💤" | < 30 |
| `affection` 낮음 | "쓸쓸해요 🥺" | < 30 |

---

### SCR-007 미션 카드

| 항목 | 내용 |
|------|------|
| **화면 ID** | SCR-007 |
| **화면 이름** | 미션 카드 |
| **진입 경로** | SCR-006 홈에서 미션 카드 탭 |
| **관련 UC** | UC-006, UC-007, UC-008 |
| **호출 API** | `GET /api/mission/v1/missions/current`, `POST /api/mission/v1/missions/{missionId}/completion-sessions`, `POST /api/mission/v1/missions/{missionId}/rejections`, `POST /api/mission/v1/missions/today-focus/next` |

#### 화면 구성

```
[상단]
- 캐릭터 이미지 (중형)
- 캐릭터 말풍선: 미션 제안 문구 (AI 생성, 캐릭터 말투 반영)

[미션 정보 카드]
- 미션 제목 (굵은 텍스트)
- 카테고리 태그 (예: 몸 / 마음 / 집 / 야외 / 공부)
- 난이도 (쉬움 / 보통 / 도전)
- 보상 별조각 (예: ✦ +10)

[하단 버튼]
- [해냈어요] → `POST /api/mission/v1/missions/{missionId}/completion-sessions` → SCR-009
- [다른 거 볼게요] → 즉시 거절 API(`POST /api/mission/v1/missions/{missionId}/rejections`) 호출 및 홈/미션 즉시 갱신

[상단 우측]
- 오늘 미션 잔여 횟수 (예: 오늘 3/15)
```

#### 미션 없음 (오늘 15개 초과)

```
캐릭터 이미지 + 말풍선:
  "오늘 미션은 여기까지야. 내일 또 새 미션 들고 올게!"
  [홈으로] 버튼
```

---

### SCR-008 미션 거절 (삭제/보류)

| 항목 | 내용 |
|------|------|
| **화면 ID** | SCR-008 |
| **화면 이름** | 미션 거절 (화면 삭제 / 즉시 거절 대체) |
| **진입 경로** | SCR-006 홈 또는 SCR-007 미션 카드에서 [다른 거 볼게요] 클릭 |
| **관련 UC** | UC-007 |
| **호출 API** | `POST /api/mission/v1/missions/{missionId}/rejections` |

#### 화면 동작 설계 (UI 화면 없음)

```
본 화면(거절 사유 입력 바텀 시트)은 기획 변경으로 인해 **제외(삭제)** 처리되었습니다.

- **동작 방식**: 사용자가 미션 거절 버튼을 탭하면 별도의 사유 입력 단계를 거치지 않고 즉각적으로 거절 API를 호출합니다.
- **화면 갱신**: 호출 성공 후 별도 화면 이동 없이 현재 미션 영역이 다음 추천 미션 카드로 매끄럽게 교체 갱신됩니다.
- **하루 제한**: 거절 횟수를 누적하여 하루 제한(15개) 초과 시 "오늘 미션은 여기까지야" 상태 뷰를 홈 미션 카드 영역에 노출합니다.
```

---

### SCR-009 미션 완료 질문

| 항목 | 내용 |
|------|------|
| **화면 ID** | SCR-009 |
| **화면 이름** | 미션 완료 질문 |
| **진입 경로** | SCR-007 "해냈어요" 버튼 클릭 |
| **관련 UC** | UC-008, UC-009 |
| **호출 API** | `POST /api/mission/v1/missions/{missionId}/completion-sessions`, `POST /api/mission/v1/missions/{missionId}/completion-answers` |

#### 화면 구성

```
[상단]
- 캐릭터 이미지 (기쁜 상태 애셋)
- 캐릭터 말풍선: 완료 반응 문구

[질문 영역]
- 질문 1개 (캐릭터 말투로 표현)
  예: "오늘 하늘은 어떤 색이었어?" / "완료하고 나서 기분이 어때?"
  (미션 템플릿의 default_question 또는 AI 생성 질문)

[답변 입력]
- 멀티라인 텍스트 입력창
  - placeholder: "한두 줄이면 충분해요 :)"
  - 최대 300자
  - 실시간 글자 수 표시

[하단]
- [답변 완료] 버튼 → `POST /api/mission/v1/missions/{missionId}/completion-answers` → SCR-010
  - 활성 조건: 1자 이상 입력
- 공백만 입력하거나 300자를 초과하면 제출 불가
```

---

### SCR-010 미션 완료 결과

| 항목 | 내용 |
|------|------|
| **화면 ID** | SCR-010 |
| **화면 이름** | 미션 완료 결과 |
| **진입 경로** | SCR-009 답변 제출 완료 후 |
| **관련 UC** | UC-009, UC-021 |
| **호출 API** | `POST /api/mission/v1/missions/{missionId}/completion-answers`, `GET /api/wallet/v1/wallets/me` |

#### 화면 구성

```
[전체화면 연출]
- 별조각 파티클 애니메이션 (✦ 터지는 효과)
- 캐릭터 이미지 (매우 기쁜 상태 애셋)

[보상 정보]
- "✦ +10 별조각 획득!"  (크고 굵게)
- 현재 별조각 잔액
- 캐릭터 반응 문구 (캐릭터 말투, AI 생성 or 템플릿)
- 상태 변화 요약 (예: "애정 +5 ❤️")

[완료 미션 요약]
- 완료한 미션 제목
- 오늘 완료 미션 수 (누적)

[하단 버튼]
- [홈으로] → SCR-006

```

---

### SCR-011 미션 히스토리

| 항목 | 내용 |
|------|------|
| **화면 ID** | SCR-011 |
| **화면 이름** | 미션 히스토리 |
| **진입 경로** | SCR-006 홈 하단 "오늘 완료 N개" 탭 |
| **관련 UC** | UC-006 |
| **호출 API** | `GET /api/mission/v1/missions/today`, `POST /api/mission/v1/missions/{missionId}/completion-sessions` |

#### 화면 구성

```
[상단]
- "오늘의 미션 기록" 제목
- 오늘 날짜
- 오늘 제안 수 / 최대 15개 / 남은 제안 수

[요약]
- 완료 수
- 거절 수
- 현재 진행 중 미션 (`currentMissionId` 기준 강조)

[목록 — 오늘 미션 스택]
각 항목:
├── stackOrder
├── 미션 제목
├── 상태 배지: 완료(초록) / 거절(회색) / 제안됨(파랑) / 답변 중(노랑)
├── 생성 시각 / 완료 시각 or 거절 시각
└── 완료 항목: 보상 별조각 표시

[진행 중 항목]
- `currentMissionId`와 같은 미션은 강조 표시
- 탭 시 SCR-009 미션 완료 질문으로 바로 이동해 현재 미션을 이어서 처리

[빈 상태]
- "아직 오늘의 미션이 없어요. 홈에서 시작해봐요!"

[하단]
- [홈으로] 버튼
```

#### API 정책

```
하루 미션 제안은 최대 15개이므로 pagination을 사용하지 않는다.
`currentMissionId`는 현재 `OFFERED` 또는 `ANSWERING` 상태 미션을 명시하기 위한 필드다.
```

---

### SCR-012 캐릭터 상세 / 돌봄

| 항목 | 내용 |
|------|------|
| **화면 ID** | SCR-012 |
| **화면 이름** | 캐릭터 상세 / 돌봄 |
| **진입 경로** | SCR-006 홈 캐릭터 이미지 탭 |
| **관련 UC** | UC-010, UC-011, UC-012, UC-013 |
| **호출 API** | `GET /api/character/v1/characters/me`, `GET /api/character/v1/characters/{characterId}/status`, `GET /api/item/v1/user-items?itemType=CONSUMABLE`, `POST /api/character/v1/characters/{characterId}/care-logs` |

#### 화면 구성

```
[상단]
- 캐릭터 이미지 (대형, 현재 상태 + 장착 아이템 반영)
- 캐릭터 이름
- 캐릭터 레벨 (MVP에서는 표기만, 실제 진화 제외)

[상태 패널]
- 포만감 (`hunger`)
  - 아이콘: 🍚 + 게이지 바
  - 문구 변환: 0~30 "배고파요", 31~70 "배불러요", 71~100 "완전 배불러요"
- 기운 (energy)
  - 아이콘: 💤 + 게이지 바
  - 문구 변환: 0~30 "피곤해요", 31~70 "괜찮아요", 71~100 "활기차요"
- 애정 (affection)
  - 아이콘: ❤️ + 게이지 바
  - 문구 변환: 0~30 "쓸쓸해요", 31~70 "좋아요", 71~100 "너무 좋아요"

[돌봄 액션 패널]
┌─────────────────────────────────────┐
│  밥 주기          재우기     놀아주기  │
│  별사탕밥 xN      구름 베개 xN 별 장난감 xN │
└─────────────────────────────────────┘
- 각 버튼 탭 → 해당 `effectType` 소모품의 `itemId`를 포함해 API 호출 + 결과 토스트
  예: "포만감 +20! 냠냠 (무무 말투)"
- 수량이 0개이면 버튼 비활성화, "보유 0개" 상태 표시

[돌봄 소모품 매핑]
- 밥 주기(`FEED`) → `effectType=FOOD`
- 재우기(`SLEEP`) → `effectType=REST`
- 놀아주기(`PLAY`) → `effectType=PLAY`

[인벤토리 진입]
- 장착 중인 스킨 미리보기
- [스킨 바꾸기] → SCR-014

[하단]
- [홈으로] 버튼
```

---

### SCR-013 상점

| 항목 | 내용 |
|------|------|
| **화면 ID** | SCR-013 |
| **화면 이름** | 상점 |
| **진입 경로** | SCR-006 홈 하단 퀵 메뉴 "상점" 아이콘 |
| **관련 UC** | UC-015, UC-016, UC-017, UC-023 |
| **호출 API** | `GET /api/item/v1/items`, `POST /api/item/v1/item-purchases`, `GET /api/wallet/v1/wallets/me` |

#### 화면 구성

```
[상단]
- 별조각 잔액 표시 (✦ N개)
- 카테고리 탭: 스킨 / 돌봄 소모품
- 탭 전환 시 해당 카테고리 상품만 노출해 모바일 긴 스크롤을 줄임

[스킨 탭]
- 아이템 카드 그리드 (2열)
  각 카드:
  ├── 스킨 프리뷰 이미지
  ├── 스킨 이름
  ├── 캐릭터 전용 배지 (`characterTypeId` 기준)
  ├── 가격 (✦ N개)
  ├── 보유 여부 배지
  └── [구매] or [보유 중] 버튼
- 현재 캐릭터 타입과 일치하는 스킨 또는 공용 스킨만 노출

[돌봄 소모품 탭]
- `GET /api/item/v1/items?itemType=CONSUMABLE`으로 구매 가능한 소모품 조회
- 별사탕밥/구름 베개/별 장난감처럼 돌봄 액션에 연결되는 아이템 표시
- 소모품은 반복 구매 가능하며 구매 확인 팝업에서 수량 선택
- 구매 시 `POST /api/item/v1/item-purchases` body `{ "itemId": number, "quantity": number }`
- 구매 완료 후 보유 수량은 SCR-012 돌봄 화면의 `GET /api/item/v1/user-items?itemType=CONSUMABLE` 결과에 반영

[구매 확인 팝업]
- "[아이템명]을 구매할까요?"
- 현재 별조각 잔액 / 구매 후 잔액 미리보기
- [확인] / [취소]
- 잔액 부족 시: "별조각이 부족해요. 미션을 완료해서 별조각을 모아봐요!"
- 상점 하단 별도 설명 카드는 두지 않고, 상품 카드에는 구매 판단에 필요한 최소 정보만 표시

```

---

### SCR-014 인벤토리

| 항목 | 내용 |
|------|------|
| **화면 ID** | SCR-014 |
| **화면 이름** | 인벤토리 |
| **진입 경로** | SCR-006 홈 하단 퀵 메뉴 "인벤토리" 아이콘 |
| **관련 UC** | UC-018, UC-019 |
| **호출 API** | `GET /api/item/v1/user-items`, `PUT /api/character/v1/characters/{characterId}/equipped-skin` |

#### 화면 구성

```
[상단]
- 스킨 보관함 제목
- MVP에서는 스킨 장착/해제를 우선 제공하고, 돌봄 소모품 사용은 SCR-012에서 실행

[스킨 탭]
- 보유 아이템 그리드
  각 카드:
  ├── 아이템 이미지
  ├── 아이템 이름
  ├── 캐릭터 전용 배지 (`characterTypeId` 기준)
  ├── 장착 중 배지 (현재 장착된 아이템에 표시)
  └── [장착] / [장착 중] 버튼
- "기본 외형" 카드
  ├── 현재 `equippedSkin === null`이면 장착 중 표시
  └── 탭 시 `PUT /api/character/v1/characters/{characterId}/equipped-skin` body `{ "itemId": null }`로 스킨 해제
- 장착 시 캐릭터 미리보기 갱신 (상단 소형 미리뷰)
- 장착 여부는 `GET /api/character/v1/characters/me`의 `equippedSkin.itemId`와 보유 아이템 `itemId`를 클라이언트에서 비교해 판단
- 현재 캐릭터 타입과 일치하는 스킨 또는 공용 스킨만 노출

[소모품]
- 보유 소모품 수량 조회는 `GET /api/item/v1/user-items?itemType=CONSUMABLE`로 가능
- 실제 사용 버튼은 캐릭터 상태와 함께 판단해야 하므로 SCR-012 돌봄 액션 패널에서 제공

[빈 상태]
- "아직 아이템이 없어요. 상점에서 골라봐요!"
- [상점 가기] → SCR-013
```

---

### SCR-015 별조각 내역

| 항목 | 내용 |
|------|------|
| **화면 ID** | SCR-015 |
| **화면 이름** | 별조각 내역 |
| **진입 경로** | SCR-006 홈 상단 별조각 잔액 탭 |
| **관련 UC** | UC-020 |
| **호출 API** | `GET /api/wallet/v1/wallets/me`, `GET /api/wallet/v1/wallets/me/transactions` |

#### 화면 구성

```
[상단]
- 현재 별조각 잔액 (크게 표시, ✦ N개)

[트랜잭션 목록]
- 최신순 정렬
- 각 항목:
  ├── 아이콘 (획득 ↑ / 사용 ↓)
  ├── 출처 (예: 미션 완료 / SNS 공유 / 아이템 구매)
  ├── 금액 (예: +10 / -30)
  ├── 거래 후 잔액
  └── 일시

[빈 상태]
- "아직 별조각 내역이 없어요. 미션을 완료해봐요!"
```

---

### SCR-016 캐릭터 카드 공유

| 항목 | 내용 |
|------|------|
| **화면 ID** | SCR-016 |
| **화면 이름** | 캐릭터 카드 공유 |
| **진입 경로** | SCR-006 홈 하단 퀵 메뉴 "공유" 아이콘 |
| **관련 UC** | UC-025, UC-026, UC-022 |
| **호출 API** | `GET /api/share/v1/presigned-url`, `POST /api/share/v1/share-cards`, `POST /api/share/v1/share-events`, `GET /api/share/v1/share-events/today` |

#### 화면 구성

```
[공유 상태]
- 오늘 공유 보상 요약 카드는 MVP 화면에서 노출하지 않음
- 보상 지급 여부는 공유 버튼 처리와 토스트/지갑 내역에서만 확인

[카드 만들기 / 입력 영역]
- 한 줄 다짐/메시지 입력창 (최대 100자)
  - placeholder: "오늘의 반짝였던 마음을 카드에 적어주세요 :)"
- [공유 카드 이미지 생성] 버튼 → POST /api/share/v1/share-cards 호출
  - characterId 및 작성한 headline 전송

[카드 미리보기 영역]
- 생성 완료 시 렌더링된 공유 카드 이미지 노출
  ├── 캐릭터 이미지 (장착 스킨 반영)
  ├── 캐릭터 이름
  ├── 오늘 완료한 미션 수
  ├── 오늘 획득 별조각
  ├── 작성한 한 줄 메시지 (headline)
  └── Polaris 로고 + "별친구와 함께한 하루" 카피

[하단 버튼]
- [SNS 공유하기] → Web Share API 호출 또는 플랫폼 선택
  - 사용자가 공유 수단 탭 시: POST /api/share/v1/share-events 호출
  - 성공 플래그 수신 시 별조각 지급 파티클 연출 및 토스트: "공유 완료! 별조각 10개 획득"
- [이미지 저장] → 로컬 디렉토리에 카드 다운로드
```

#### 공유 링크 구조

```
https://polaris.app/share/{shareId}?utm_source=share&utm_medium=sns
```

---

### SCR-017 공유 링크 랜딩 (외부 유입)

| 항목 | 내용 |
|------|------|
| **화면 ID** | SCR-017 |
| **화면 이름** | 공유 링크 랜딩 |
| **진입 경로** | SNS 공유 링크 클릭 (외부 유입) |
| **관련 UC** | UC-027 |
| **호출 API** | `GET /api/share/v1/share-links/{shareId}` |

#### 화면 구성

```
[상단]
- Polaris 로고

[카드 미리보기]
- 공유된 캐릭터 카드 이미지 데이터 로드 (GET /api/share/v1/share-links/{shareId})
  - 브라우저 진입 즉시 마케팅 클릭 로그(`share_clicks` 테이블)가 서버 측에서 비동기로 자동 적재됩니다.
- 공유한 사용자의 캐릭터 이름 + 한 줄 각오 메시지(headline) 및 카드 이미지 노출

[서비스 소개 (1~2줄)]
- "나만의 별친구와 오늘을 기록해봐요"

[CTA 버튼]
- [나도 시작하기] → SCR-001 (랜딩) or 직접 SCR-002 (로그인)
  - `signupUrl` 기반으로 `shareId` 파라미터가 회원가입 경로까지 자연스럽게 유지되어 가입 시 추천인 유입 추적이 완벽히 작동합니다.

[비로그인 상태 처리]
- 공유된 카드는 비로그인 대중(Public)에게 완전 개방되어 자유롭게 조회가 가능합니다.
```

---

### SCR-018 업적 (MVP 제외/보류)

| 항목 | 내용 |
|------|------|
| **화면 ID** | SCR-018 |
| **화면 이름** | 업적 |
| **진입 경로** | MVP에서는 제공하지 않음 |
| **관련 UC** | UC-029, UC-030 |
| **호출 API** | API 미제공 |

#### MVP 처리

```
업적은 PRD상 MVP 제외 기능이며, 현재 API 명세에도 endpoint가 없다.
홈 퀵 메뉴와 마이페이지 활동 요약에는 업적 진입/수치를 노출하지 않는다.
향후 업적 API가 확정되면 별도 화면 설계로 복구한다.
```

---

### SCR-019 출석 체크

| 항목 | 내용 |
|------|------|
| **화면 ID** | SCR-019 |
| **화면 이름** | 출석 체크 |
| **진입 경로** | SCR-021 마이페이지 또는 홈 출석 배너 |
| **관련 UC** | UC-028 |
| **호출 API** | `POST /api/attendance/v1/attendance-records`, `GET /api/attendance/v1/attendance-records` |

#### 화면 구성

```
[상단]
- "출석 체크" 제목
- 연속 출석 일수 (예: 🔥 5일 연속 출석 중)

[캘린더]
- 월 단위 달력
- 출석일: ✦ 스탬프 표시
- 미출석일: 빈칸
- 오늘: 강조 테두리

[출석 버튼]
- 오늘 미출석 시: [오늘 출석하기] → `POST /api/attendance/v1/attendance-records`
  - 완료 토스트: "출석 완료! ✦ +5"
- 오늘 출석 완료 시: "오늘 출석 완료 ✓" (비활성)
```

---

### SCR-020 알림함

| 항목 | 내용 |
|------|------|
| **화면 ID** | SCR-020 |
| **화면 이름** | 알림함 |
| **진입 경로** | SCR-006 홈 상단 알림 아이콘 |
| **관련 UC** | UC-031 |
| **호출 API** | `GET /api/notification/v1/notifications`, `PATCH /api/notification/v1/notifications/{notificationId}` |

#### 화면 구성

```
[상단]
- "알림" 제목
- 전체 읽음 처리 버튼

[알림 목록]
각 항목:
├── 알림 유형 아이콘
│   - 🎯 미션 제안 (MISSION_OFFER)
│   - 😴 상태 악화 (STATE_BAD / STATE_CRITICAL)
│   - 📅 일일 리마인더 (DAILY_REMINDER)
├── 알림 제목 + 본문 (1줄 말줄임)
├── 시간 (예: 2시간 전)
└── 읽음/미읽음 표시

[알림 설정 진입]
- 우측 상단 ⚙️ → SCR-021 마이페이지 알림 설정 섹션

[빈 상태]
- "새 알림이 없어요"
```

---

### SCR-021 마이페이지

| 항목 | 내용 |
|------|------|
| **화면 ID** | SCR-021 |
| **화면 이름** | 마이페이지 |
| **진입 경로** | 하단 네비게이션 바 "마이" 탭 |
| **관련 UC** | UC-031 |
| **호출 API** | `GET /api/user/v1/users/me`, `DELETE /api/auth/v1/sessions/current` |

#### 화면 구성

```
[프로필 섹션]
- Google 프로필 이미지
- 사용자 표시 이름 (display_name)
- 이메일 (마스킹 처리)
- 별조각 잔액 → SCR-015 진입

[활동 요약]
- 총 완료 미션 수
- 연속 출석 일수
- 보유 별조각

[설정 섹션]
─ 알림 설정
  - 전체 알림 ON/OFF 토글
  - 미션 제안 알림 ON/OFF
  - 상태 알림 ON/OFF
  - 일일 리마인더 ON/OFF
  - 방해 금지 시간 설정 (시작/종료 시각)
  - FCM 푸시 구독은 `POST /api/notification/v1/subscriptions/`로 토큰 저장
  - 세부 알림 설정 저장 API는 현재 명세에 없으므로 MVP에서는 로컬 설정으로 처리

─ 계정
  - [로그아웃] → `DELETE /api/auth/v1/sessions/current` → SCR-002
  - [서비스 이용약관]
  - [개인정보처리방침]
  - 앱 버전 정보

```

---

## 4. 네비게이션 구조

```
앱 진입
  │
  ├── [비로그인 / 최초 진입] → SCR-002 Google 로그인 (진입 화면)
  │
  └── [로그인 완료]
        │
        ├── [온보딩 미완] → SCR-003 ~ SCR-005 순서
        │
        └── [온보딩 완료] → SCR-006 홈 (기본 화면)
                │
                ├── 상단: 별조각 → SCR-015
                ├── 상단: 알림 → SCR-020
                ├── 캐릭터 이미지 탭 → SCR-012
                ├── 미션 카드 [해냈어요] → SCR-009
                ├── 미션 카드 [다른 거] → 즉시 거절 API 호출 후 다음 미션 갱신
                ├── 퀵메뉴: 상점 → SCR-013
                ├── 퀵메뉴: 인벤토리 → SCR-014
                ├── 퀵메뉴: 공유 → SCR-016
                └── 하단 네비: 마이 → SCR-021
```

---

## 5. 공통 UI 컴포넌트

| 컴포넌트 | 설명 | 사용 화면 |
|---------|------|---------|
| **별조각 배지** | ✦ N개 표시, 탭 시 SCR-015 이동 | SCR-006, SCR-013, SCR-010 |
| **캐릭터 말풍선** | 캐릭터 말투 반영 텍스트 박스 | 전 화면 |
| **상태 게이지 바** | 포만감/기운/애정 3개 인디케이터 | SCR-006, SCR-012 |
| **토스트 메시지** | 하단 2초 노출 알림 (성공/에러) | 전 화면 |
| **로딩 스피너** | API 호출 중 표시 | 전 화면 |
| **바텀 시트** | 확장용 오버레이 패널. MVP 미션 거절에는 사용하지 않음 | 향후 확장 |
| **확인 팝업** | 구매 확인 등 2-버튼 모달 | SCR-013 |

---

## 6. 화면 전환 흐름

### 6.1 온보딩 플로우

```
SCR-002 Google 로그인 (진입 화면)
  → SCR-003 캐릭터 선택
    → SCR-004 캐릭터 이름 설정
      → SCR-005 온보딩 설문 (7문항)
        → SCR-006 홈 (첫 미션 자동 생성)
```

### 6.2 미션 완료 플로우

```
SCR-006 홈
  → SCR-007 미션 카드 확인
    → [해냈어요] SCR-009 미션 완료 질문
      → SCR-010 미션 완료 결과 (별조각 지급)
        → SCR-006 홈 (상태 갱신)
```

### 6.3 미션 거절 플로우

```
SCR-006 홈 또는 SCR-007 미션 카드
  → [다른 거 볼게요] 즉시 거절 API 호출 (SCR-008 오버레이 생략)
    → SCR-006 홈 (다음 미션으로 즉시 교체 갱신)
      → (15개 초과 시) 오늘 미션 종료 안내
```

### 6.4 공유 플로우

```
SCR-006 홈 퀵메뉴
  → SCR-016 캐릭터 카드 공유 (한 줄 다짐 작성 및 카드 이미지 발급)
    → [SNS 공유 수단 탭] POST /api/share/v1/share-events 호출 및 별조각 +10 즉시 지급
      → SCR-017 공유 링크 랜딩 (외부 사용자 진입 시 클릭 로그 자동 비동기 적재)
        → SCR-002 Google 로그인 (shareId 기반 회원가입 유입 추적)
```

### 6.5 돌봄 플로우

```
SCR-006 홈 캐릭터 이미지 탭
  → SCR-012 캐릭터 상세 / 돌봄
    → `GET /api/item/v1/user-items?itemType=CONSUMABLE`로 보유 수량 조회
    → [밥 주기] FOOD 아이템 `itemId` 포함 `POST /api/character/v1/characters/{characterId}/care-logs`
    → [재우기] REST 아이템 `itemId` 포함 `POST /api/character/v1/characters/{characterId}/care-logs`
    → [놀아주기] PLAY 아이템 `itemId` 포함 `POST /api/character/v1/characters/{characterId}/care-logs`
      → 상태 변화 토스트 → SCR-012 상태 갱신
```

---

**문서 버전 이력**

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| v1.0 | 2026-05-14 | 초안 작성 (PRD v0.6 + 프로토타입 v0.4 기준) | Backend Team |
