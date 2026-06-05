# Polaris frontend assets

이 폴더는 프론트 앱에서 사용하는 원본 이미지 에셋을 모아 둔 공간입니다.
앱 코드는 파일 경로를 직접 참조하지 않고, 가능한 한 `apps/web/src/shared/assets/polarisAssets.ts`의 asset registry를 통해 사용합니다.

## 현재 사용 기준

- 앱 화면에서 바로 쓰는 에셋은 `polarisAssets.ts`에 key로 등록합니다.
- 새 화면에서 쓸 예정인 에셋도 PR 단위가 명확하면 registry에 먼저 등록할 수 있습니다.
- 파일명은 `도메인-대상-상태.png` 형태를 우선합니다.
- 캐릭터 상태 파일은 `idle`, `happy`, `sleepy`, `hungry`, `low-energy`, `lonely` 이름을 사용합니다.
- 성장 단계는 `lv1`, `lv2`, `lv3` 폴더로 나눕니다.

## 폴더 역할

| 폴더 | 역할 |
| --- | --- |
| `attendance/` | 출석 도장, 연속 출석 배너 |
| `brand/` | 현재 앱에서 쓰는 로고, 파비콘, OG 이미지 |
| `categories/` | 신규 미션 카테고리 6종 이미지 |
| `characters/` | 기본 캐릭터 상태와 성장 단계별 캐릭터 이미지 |
| `currency/` | 별조각 화폐 아이콘 |
| `effects/` | 보상, 성장, 파티클, 스탬프 효과 |
| `empty-states/` | 빈 상태와 에러 상태 일러스트 |
| `growth/` | 성장 배지, 성장 오라 같은 보조 에셋 |
| `items/` | 소모품/상점 아이템 이미지 |
| `memories/` | 기억 조각, 기억 해금 상태 에셋 |
| `notifications/` | 알림 유형별 아이콘 |
| `share-card/` | 공유 카드 배경, 장식, 캐릭터, 스탬프 |
| `skins/` | 장착 스킨 썸네일과 캐릭터별 스킨 상태 이미지 |
| `talk/` | 별친구 대화 UI 보조 에셋 |
| `weather/` | 날씨와 시간대 미션 보조 에셋 |

## 루트 유지 파일

루트에는 앱 CSS와 brand registry에서 직접 쓰는 `pattern-stardust.svg`만 유지합니다.
캐릭터, 로고, 카테고리, 빈 상태, 상점 아이템은 모두 도메인별 하위 폴더로 정리했습니다.

## 삭제 전 체크리스트

에셋을 삭제하거나 이동하기 전에는 아래를 모두 확인합니다.

1. `polarisAssets.ts`에서 참조하지 않는다.
2. `apps/web/src`에서 직접 참조하지 않는다.
3. `preview/`, `ui_kits/`, `docs/`에서 필요한 참조가 아니거나 함께 갱신했다.
4. `pnpm --filter @polaris/web typecheck`가 통과한다.
5. `pnpm --filter @polaris/web build`가 통과한다.
