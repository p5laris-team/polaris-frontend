/* ============================================================
   Polaris — Inline SVG icons (Lucide style: 1.75 stroke, round caps)
   ------------------------------------------------------------
   사용: <Icon name="home" size={24} />  또는 <IconHome size={20} />
   모든 아이콘은 currentColor 상속.
   ============================================================ */

const STROKE_PROPS = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function Svg({ size = 24, children, ...rest }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      {...STROKE_PROPS}
      {...rest}
    >
      {children}
    </svg>
  );
}

const IconHome = (p) => (
  <Svg {...p}>
    <path d="M3 12 L12 3 L21 12" />
    <path d="M5 10 L5 21 L19 21 L19 10" />
  </Svg>
);

const IconList = (p) => (
  <Svg {...p}>
    <rect x="4" y="4" width="16" height="16" rx="3" />
    <path d="M8 12 L11 15 L16 9" />
  </Svg>
);

const IconStar = (p) => (
  <Svg {...p}>
    <path d="M12 2 L14.5 8.5 L21 9.3 L16 13.9 L17.5 20.5 L12 17 L6.5 20.5 L8 13.9 L3 9.3 L9.5 8.5 Z" />
  </Svg>
);

const IconShop = (p) => (
  <Svg {...p}>
    <path d="M4 7 L20 7 L18 19 L6 19 Z" />
    <path d="M8 7 L8 5 C8 3.5 9.5 2.5 12 2.5 C14.5 2.5 16 3.5 16 5 L16 7" />
  </Svg>
);

const IconUser = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21 C4 16 8 14 12 14 C16 14 20 16 20 21" />
  </Svg>
);

const IconArrowLeft = (p) => (
  <Svg {...p}>
    <path d="M15 6 L9 12 L15 18" />
  </Svg>
);

const IconArrowRight = (p) => (
  <Svg {...p}>
    <path d="M9 6 L15 12 L9 18" />
  </Svg>
);

const IconMore = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="5" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="12" cy="19" r="1.4" fill="currentColor" stroke="none" />
  </Svg>
);

const IconBell = (p) => (
  <Svg {...p}>
    <path d="M6 16 L18 16 L17 14 C16 13 16 11 16 9 C16 6 14 4 12 4 C10 4 8 6 8 9 C8 11 8 13 7 14 Z" />
    <path d="M10 19 C10 20.5 11 21 12 21 C13 21 14 20.5 14 19" />
  </Svg>
);

const IconSettings = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2 L13 5 M12 19 L13 22 M2 12 L5 13 M19 12 L22 13 M5 5 L7 7 M17 17 L19 19 M5 19 L7 17 M17 7 L19 5" />
  </Svg>
);

const IconPlus = (p) => (
  <Svg {...p} strokeWidth="2.2">
    <path d="M12 5 L12 19 M5 12 L19 12" />
  </Svg>
);

const IconCheck = (p) => (
  <Svg {...p} strokeWidth="2.4">
    <path d="M5 12 L10 17 L19 7" />
  </Svg>
);

const IconClose = (p) => (
  <Svg {...p}>
    <path d="M6 6 L18 18 M18 6 L6 18" />
  </Svg>
);

const IconSearch = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M16.5 16.5 L21 21" />
  </Svg>
);

const IconHeart = (p) => (
  <Svg {...p}>
    <path d="M12 21 C12 21 3 14 3 8 C3 5 5 3 8 3 C10 3 12 5 12 5 C12 5 14 3 16 3 C19 3 21 5 21 8 C21 14 12 21 12 21 Z" />
  </Svg>
);

const IconChat = (p) => (
  <Svg {...p}>
    <path d="M4 5 L20 5 L20 17 L13 17 L8 21 L8 17 L4 17 Z" />
  </Svg>
);

const IconPlay = (p) => (
  <Svg {...p}>
    <path d="M7 4 L19 12 L7 20 Z" fill="currentColor" />
  </Svg>
);

const IconCalendar = (p) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 9 L21 9 M8 3 L8 7 M16 3 L16 7" />
  </Svg>
);

const IconLock = (p) => (
  <Svg {...p}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11 L8 7 C8 5 10 3 12 3 C14 3 16 5 16 7 L16 11" />
  </Svg>
);

const IconBook = (p) => (
  <Svg {...p}>
    <path d="M4 4 L11 4 C12 4 12 5 12 6 L12 20 C12 19 11 19 10 19 L4 19 Z" />
    <path d="M20 4 L13 4 C12 4 12 5 12 6 L12 20 C12 19 13 19 14 19 L20 19 Z" />
  </Svg>
);

Object.assign(window, {
  Icon: ({ name, ...p }) => {
    const map = {
      home: IconHome, list: IconList, star: IconStar, shop: IconShop, user: IconUser,
      "arrow-left": IconArrowLeft, "arrow-right": IconArrowRight, more: IconMore,
      bell: IconBell, settings: IconSettings, plus: IconPlus, check: IconCheck,
      close: IconClose, search: IconSearch, heart: IconHeart, chat: IconChat,
      play: IconPlay, calendar: IconCalendar, lock: IconLock, book: IconBook,
    };
    const C = map[name];
    return C ? <C {...p} /> : null;
  },
  IconHome, IconList, IconStar, IconShop, IconUser,
  IconArrowLeft, IconArrowRight, IconMore, IconBell, IconSettings,
  IconPlus, IconCheck, IconClose, IconSearch, IconHeart, IconChat,
  IconPlay, IconCalendar, IconLock, IconBook,
});
