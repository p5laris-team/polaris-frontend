# Fonts

Polaris는 다음 세 폰트를 사용합니다. 현재 모두 **CDN에서 로드**되며, `colors_and_type.css`의 `@import` 구문이 자동으로 가져옵니다.

| 폰트 | 용도 | CDN 소스 |
|---|---|---|
| **Pretendard Variable** | 한글 본문/UI 기본 | [jsDelivr · orioncactus/pretendard@v1.3.9](https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.css) |
| **Noto Serif KR** | 감성 디스플레이/인용 한정 | [Google Fonts](https://fonts.google.com/specimen/Noto+Serif+KR) |
| **JetBrains Mono** | 모노스페이스(코드·숫자 정렬) | [Google Fonts](https://fonts.google.com/specimen/JetBrains+Mono) |

## ⚠️ 폰트 파일 교체 안내

이 폴더는 현재 비어 있습니다. **오프라인 배포·자체 호스팅·정식 라이선스 관리**가 필요하면 아래 단계를 따르세요:

1. 각 폰트의 공식 배포처에서 라이선스 파일(`.woff2` / `.ttf`)을 다운로드:
   - Pretendard: https://github.com/orioncactus/pretendard/releases (OFL 라이선스)
   - Noto Serif KR: https://fonts.google.com/specimen/Noto+Serif+KR (OFL)
   - JetBrains Mono: https://www.jetbrains.com/lp/mono/ (OFL)
2. 파일을 이 폴더(`fonts/`)에 배치.
3. `colors_and_type.css` 상단의 `@import` 두 줄을 제거하고, 아래 `@font-face` 구문으로 교체:

```css
@font-face {
  font-family: "Pretendard Variable";
  src: url("./fonts/PretendardVariable.woff2") format("woff2-variations");
  font-weight: 45 920;
  font-display: swap;
}
@font-face {
  font-family: "Noto Serif KR";
  src: url("./fonts/NotoSerifKR-Bold.woff2") format("woff2");
  font-weight: 700;
  font-display: swap;
}
/* ...JetBrains Mono 동일 패턴 */
```

## React Native 사용 시

React Native에서는 폰트 파일을 `android/app/src/main/assets/fonts/` 와 iOS 번들에 추가한 뒤 `link` 하세요. `font-family` 이름은 파일명에서 확장자 제외한 값이 됩니다 (`Pretendard-Regular.ttf` → `font-family: "Pretendard-Regular"`).
