/* ============================================================
   Polaris — RN-Compatible Design Tokens (JS export)
   ------------------------------------------------------------
   colors_and_type.css 의 토큰을 React Native에서 import 할 수
   있도록 동일 값을 JS 객체로 노출. CSS 변수 같은 동적 테마
   전환은 RN에서 ThemeContext + useTheme 훅 패턴 사용 권장.
   ------------------------------------------------------------
   사용 예 (React Native):

     import { tokens } from './tokens';
     const styles = StyleSheet.create({
       card: {
         backgroundColor: tokens.color.latte.bg2,
         borderRadius: tokens.radius.lg,
         padding: tokens.space[6],
         ...tokens.shadow.sm,
       },
     });
   ============================================================ */

export const tokens = {
  /* ---------- Color (테마별) ---------- */
  color: {
    latte: {
      bg1: "#FAF5E9",
      bg2: "#FFFFFF",
      bg3: "#F2EBDA",
      bg4: "#E8DFC9",
      bgCharacter: "#F7EAD3",
      fg1: "#2D2418",
      fg2: "#5C5340",
      fg3: "#8A8170",
      fg4: "#B5AC97",
      fgOnPrimary: "#FFFFFF",
      primary: "#E07A5F",
      primaryHover: "#C95F47",
      primaryPress: "#A84A36",
      primarySoft: "#FBEDE3",
      primaryStrong: "#823727",
      accent: "#F4D35E",
      accentSoft: "#FEF7E0",
      border1: "rgba(45,36,24,0.06)",
      border2: "rgba(45,36,24,0.10)",
      border3: "rgba(45,36,24,0.18)",
    },
    mint: {
      bg1: "#EEF7F0",
      bg2: "#FFFFFF",
      bg3: "#E2EFE5",
      bg4: "#CFE3D2",
      bgCharacter: "#DCEFE2",
      fg1: "#1F2D24",
      fg2: "#4F5E54",
      fg3: "#7E8C82",
      fg4: "#ABB8AE",
      primary: "#4FB3A4",
      primaryHover: "#3C9989",
      primarySoft: "#E6F4EF",
      primaryStrong: "#1F574B",
      accent: "#F4D35E",
      accentSoft: "#FEF7E0",
    },
    cloud: {
      bg1: "#F2F5FB",
      bg2: "#FFFFFF",
      bg3: "#E5EBF5",
      bg4: "#D0D9E8",
      bgCharacter: "#E2E9F5",
      fg1: "#1F2A40",
      fg2: "#4D5874",
      fg3: "#7B85A0",
      fg4: "#B0B7C9",
      primary: "#6F90DA",
      primaryHover: "#5878C5",
      primarySoft: "#ECF1FB",
      primaryStrong: "#2A4378",
      accent: "#F7B5A8",
      accentSoft: "#FCE4DA",
    },
    // dark mode — 모든 테마 공통 그라운드
    dark: {
      bg1: "#16140E",
      bg2: "#221E15",
      bg3: "#2D281C",
      bg4: "#3A3424",
      bgCharacter: "#2A2316",
      fg1: "#F5EFE2",
      fg2: "#C9C1AD",
      fg3: "#948C7A",
      fg4: "#5F594B",
    },
    semantic: {
      success: "#5B9A6F",
      successSoft: "#DCEEDF",
      warning: "#D98531",
      warningSoft: "#FBE6CE",
      danger: "#C95252",
      dangerSoft: "#F8DCDC",
    },
  },

  /* ---------- Spacing (px) ---------- */
  space: {
    0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 28,
    8: 32, 10: 40, 12: 48, 16: 64, 20: 80, 24: 96,
  },

  /* ---------- Radius ---------- */
  radius: {
    xs: 6, sm: 10, md: 14, button: 16, lg: 20, xl: 28, xxl: 36, pill: 999, full: 999,
  },

  /* ---------- Type ---------- */
  font: {
    sans: "Pretendard-Variable",          // RN: link Pretendard-Variable.ttf
    display: "SUIT-Variable",             // RN: link SUIT-Variable.ttf
    character: "Gaegu-Bold",
    mono: "JetBrainsMono-Regular",
  },
  fontSize: {
    11: 11, 12: 12, 13: 13, 14: 14, 15: 15, 16: 16, 17: 17, 18: 18,
    20: 20, 22: 22, 24: 24, 28: 28, 32: 32, 36: 36, 44: 44,
  },
  fontWeight: {
    regular: "400", medium: "500", semibold: "600", bold: "700", extrabold: "800",
  },
  lineHeight: {
    tight: 1.25, snug: 1.4, normal: 1.55, relaxed: 1.7,
  },

  /* ---------- Shadow (RN platform-specific) ---------- */
  shadow: {
    xs: {
      shadowColor: "#2D2418", shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
    },
    sm: {
      shadowColor: "#2D2418", shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    },
    md: {
      shadowColor: "#2D2418", shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08, shadowRadius: 18, elevation: 4,
    },
    lg: {
      shadowColor: "#2D2418", shadowOffset: { width: 0, height: 14 },
      shadowOpacity: 0.10, shadowRadius: 32, elevation: 8,
    },
    character: {
      shadowColor: "#E07A5F", shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.16, shadowRadius: 28, elevation: 12,
    },
  },

  /* ---------- Motion (Animated 사용 시 참고) ---------- */
  motion: {
    duration: {
      instant: 80, fast: 140, base: 220, slow: 360, deliberate: 520, character: 680,
    },
    // RN에서는 Easing.bezier(...) 사용
    easing: {
      out: [0.22, 1, 0.36, 1],
      inOut: [0.65, 0, 0.35, 1],
      spring: [0.34, 1.56, 0.64, 1],
      bounce: [0.68, -0.55, 0.27, 1.55],
    },
  },
};

export default tokens;
