# Polaris — Web UI Kit

React + Babel inline 으로 작성된 모바일 퍼스트 클릭스루 프로토타입.

## 구성

- `index.html` — 데모 진입점. Tweaks 패널로 테마(Latte/Mint/Cloud) + 모드(Light/Dark) 전환
- `app.jsx` — 라우터 상태 + 앱 셸
- `components.jsx` — 공통 UI 컴포넌트 (Button, Card, Header, BottomTabs, MissionCard, CharacterStage 등)
- `icons.jsx` — Lucide-스타일 SVG 인라인 아이콘 (의존성 없이)
- `screens-auth.jsx` — 로그인, 캐릭터 선택, 온보딩 설문
- `screens-app.jsx` — 홈, 미션 목록, 캐릭터 상세/돌봄, 상점/인벤토리
- `tweaks-panel.jsx` — Tweaks UI (starter component)
- `styles.css` — 컴포넌트 클래스 (토큰은 `../../colors_and_type.css`)

## 7개 핵심 화면

1. **로그인** — 카카오/구글 OAuth 모형 + 이메일 로그인
2. **캐릭터 선택** — 별이 · 구름이 · 콩이 셋 중 하나
3. **온보딩 설문** — 루틴 시간대 / 관심 카테고리 / 알림 시간
4. **홈** — 캐릭터 무대 + 오늘의 진행률 + 미션 위젯
5. **미션 목록** — 카테고리 필터 + 미션 카드 리스트
6. **캐릭터 상세 / 돌봄** — 캐릭터 상세, 호감도/레벨, 액션(밥주기/놀기/말걸기)
7. **상점 / 인벤토리** — 별가루 잔액, 아이템 구매, 보유 아이템

## React Native 호환성

`components.jsx`는 RN 호환을 염두에 두고 컨테이너/뷰/텍스트 구조를 유지했지만, 실제 DOM 노드(`div`, `span`)를 사용합니다. RN으로 옮길 때:

- `div` → `View`
- `span`, `p`, `h1~h6` → `Text`
- `button` → `Pressable` + `onPress`
- CSS 클래스 → StyleSheet (token JS 값은 `ui_kits/mobile/tokens.js` 참고)
- 이미지: `<img src>` → `<Image source={require(...)}>`
