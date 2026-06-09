# Polaris — Mobile UI Kit (Android · React Native)

웹 UI 키트의 동일한 컴포넌트와 화면을 **Android 디바이스 프레임 안**에서 시연합니다.
실제 React Native 앱은 이 키트의 토큰(`tokens.js`)과 컴포넌트 구조를 참고하여 별도 구현하세요.

## 구성

- `index.html` — Android Material 3 디바이스 프레임 (412×892) 안에서 동일 화면 시연
- `android-frame.jsx` — Android 디바이스 프레임 컴포넌트 (스타터)
- `mobile-app.jsx` — 프레임 + 라우터 + Tweaks
- `tokens.js` — **React Native 호환 디자인 토큰 JS export**

웹 키트와 동일한 컴포넌트/화면을 사용하므로 별도 구현은 없습니다 (`../web/*.jsx` 재사용).

## React Native 포팅 가이드

웹 UI 키트의 컴포넌트를 RN으로 옮길 때:

### 1. 토큰

```js
import { tokens } from './tokens';

const { color, space, radius, font, shadow, motion } = tokens;
// 활성 테마 선택
const theme = color.latte;     // 또는 color.mint, color.cloud
```

### 2. 엘리먼트 매핑

| Web | React Native |
|---|---|
| `<div>` | `<View>` |
| `<span>`, `<p>`, `<h1~6>` | `<Text>` |
| `<button>` | `<Pressable>` 또는 `<TouchableOpacity>` |
| `<img src>` | `<Image source={require(...)}>` 또는 `<SvgUri>` (react-native-svg) |
| `<input>` | `<TextInput>` |
| CSS class | `StyleSheet.create({...})` |
| `onClick` | `onPress` |
| `flex: 1` | 동일 |
| `background` (CSS) | `backgroundColor` |
| `border-radius` | `borderRadius` |

### 3. 폰트

`assets/` 폴더에서 Pretendard / SUIT / Gaegu / JetBrains Mono `.ttf` 파일을 받아 RN 프로젝트의 `android/app/src/main/assets/fonts/` 와 iOS 번들에 추가하고 `npx react-native-asset link`. `font-family`는 파일명에서 확장자를 뺀 값 (`Pretendard-Variable`, `SUIT-Variable`).

### 4. 아이콘

```bash
npm install lucide-react-native react-native-svg
```

```jsx
import { Home, List, Star, ShoppingBag, User } from 'lucide-react-native';

<Home size={22} color={theme.fg1} strokeWidth={1.75} />
```

### 5. SVG 자산

```bash
npm install react-native-svg
npm install -D react-native-svg-transformer
```

캐릭터·일러스트는 현재 PNG 에셋을 기준으로 사용합니다:

```jsx
import NovaIdle from '../../assets/characters/nova/core/character-nova-idle.png';
<Image source={NovaIdle} style={{ width: 150, height: 150 }} />
```

### 6. 컴포넌트 골격 예시

```jsx
// MissionCard.tsx (RN 버전)
import { View, Text, Pressable, Image } from 'react-native';
import { tokens } from '../tokens';

const theme = tokens.color.latte;

export function MissionCard({ mission, onToggle }) {
  return (
    <Pressable
      onPress={() => onToggle(mission.id)}
      style={({ pressed }) => [{
        flexDirection: 'row',
        alignItems: 'center',
        gap: tokens.space[3],
        padding: tokens.space[4],
        backgroundColor: theme.bg2,
        borderRadius: tokens.radius.lg,
        borderWidth: 1,
        borderColor: theme.border1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
        ...tokens.shadow.xs,
      }]}
    >
      {/* ... */}
    </Pressable>
  );
}
```

### 7. 테마 전환

CSS 변수처럼 동적 스왑은 RN에서 안 되므로 `ThemeContext` 패턴 사용:

```jsx
const ThemeContext = React.createContext(tokens.color.latte);
const useTheme = () => React.useContext(ThemeContext);

function App() {
  const [name, setName] = React.useState('latte');
  return (
    <ThemeContext.Provider value={tokens.color[name]}>
      {/* ... */}
    </ThemeContext.Provider>
  );
}
```

## ⚠️ 시각적 재현, 코드 재현이 아님

`index.html`의 안드로이드 프레임 데모는 **시각적 검증용**입니다.
실제 RN 런타임에서 동일하게 보이도록 컴포넌트를 다시 작성해야 합니다 — 위 가이드를 따르세요.
