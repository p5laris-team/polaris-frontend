/**
 * 하단 탭 공통 UI입니다.
 * 홈, 미션, 별친구, 상점, 마이페이지처럼 매일 쓰는 핵심 화면만 빠르게 이동하게 합니다.
 */
import { Home, List, ShoppingBag, Star, User } from "lucide-react";

import "./BottomTabs.css";

export type BottomTabKey = "home" | "missions" | "character" | "shop" | "me";

type BottomTabsProps = {
  active: BottomTabKey;
  onChange: (key: BottomTabKey) => void;
};

// 탭 key, 라벨, 아이콘을 한 배열로 관리해서 순서 변경과 항목 추가가 쉽습니다.
const tabs = [
  { key: "home", label: "홈", icon: Home },
  { key: "missions", label: "미션", icon: List },
  { key: "character", label: "별친구", icon: Star },
  { key: "shop", label: "상점", icon: ShoppingBag },
  { key: "me", label: "나", icon: User },
] satisfies Array<{ key: BottomTabKey; label: string; icon: typeof Home }>;

/** 선택된 탭을 강조하고 클릭 시 상위 컴포넌트에 key를 넘깁니다. */
export function BottomTabs({ active, onChange }: BottomTabsProps) {
  return (
    // 하단 탭은 매일 자주 쓰는 핵심 화면만 둔다. 보조 화면은 각 화면의 CTA에서 접근한다.
    <nav className="bottom-tabs" aria-label="하단 탭">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const selected = active === tab.key;

        return (
          <button
            key={tab.key}
            className={`bottom-tabs__tab ${selected ? "bottom-tabs__tab--active" : ""}`}
            type="button"
            aria-current={selected ? "page" : undefined}
            onClick={() => onChange(tab.key)}
          >
            <Icon size={22} strokeWidth={1.75} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
