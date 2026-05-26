# Fonts

Polaris는 운영 화면과 canvas 공유 카드 저장본의 폰트 차이를 줄이기 위해 웹폰트를 **self-host**합니다.
폰트 파일은 이 폴더에 두고, `colors_and_type.css`의 `@font-face`가 상대 경로로 불러옵니다.

| 파일 | CSS font-family | 용도 | 원본 |
|---|---|---|
| `PretendardVariable.woff2` | `"Pretendard Variable"` | 한글 본문/UI 기본 | [orioncactus/pretendard v1.3.9](https://github.com/orioncactus/pretendard) |
| `SUIT-Variable.woff2` | `"SUIT Variable"` | 제목/버튼/공유 카드 디스플레이 | [sun-typeface/SUIT v2](https://github.com/sun-typeface/SUIT) |
| `Gaegu-Regular.ttf` | `"Gaegu"` | 캐릭터/감성 텍스트 400 | [Google Fonts · Gaegu](https://fonts.google.com/specimen/Gaegu) |
| `Gaegu-Bold.ttf` | `"Gaegu"` | 캐릭터/감성 텍스트 700 | [Google Fonts · Gaegu](https://fonts.google.com/specimen/Gaegu) |
| `JetBrainsMono-Regular.ttf` | `"JetBrains Mono"` | 모노스페이스 400 | [Google Fonts · JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) |
| `JetBrainsMono-Medium.ttf` | `"JetBrains Mono"` | 모노스페이스 500 | [Google Fonts · JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) |

## 사용 방식

`colors_and_type.css` 상단에서 아래처럼 등록합니다.

```css
@font-face {
  font-family: "Pretendard Variable";
  src: url("./fonts/PretendardVariable.woff2") format("woff2-variations");
  font-weight: 45 920;
  font-display: swap;
}
```

React 앱은 `apps/web/src/main.tsx`에서 루트의 `colors_and_type.css`를 import하므로, Vite build 시 폰트도 함께 asset으로 포함됩니다.

## 운영에서 중요한 이유

canvas는 DOM처럼 폰트가 늦게 로드된 뒤 자동으로 다시 그려지지 않습니다.
공유 카드 이미지를 만들 때 폰트가 아직 CDN에서 내려오지 않았으면 fallback 폰트 기준으로 픽셀이 저장됩니다.
그래서 운영/포트폴리오 배포에서는 CDN `@import`보다 self-host 폰트가 더 안정적입니다.

## 폰트 교체 방법

1. 공식 배포처에서 새 폰트 파일을 다운로드합니다.
2. 이 폴더의 기존 파일을 교체합니다.
3. 파일명이 바뀌면 `colors_and_type.css`의 `@font-face src`도 함께 수정합니다.
4. `pnpm --filter @polaris/web build` 또는 `apps/web/node_modules/.bin/vite build`로 빌드에 포함되는지 확인합니다.

예시:

```css
@font-face {
  font-family: "Gaegu";
  src: url("./fonts/Gaegu-Bold.ttf") format("truetype");
  font-weight: 700;
  font-display: swap;
}
```

## React Native 사용 시

React Native에서는 폰트 파일을 `android/app/src/main/assets/fonts/` 와 iOS 번들에 추가한 뒤 `link` 하세요.
`font-family` 이름은 파일명에서 확장자 제외한 값이 됩니다 (`Pretendard-Regular.ttf` → `font-family: "Pretendard-Regular"`).
