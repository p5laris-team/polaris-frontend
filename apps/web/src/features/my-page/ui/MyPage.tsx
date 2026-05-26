/**
 * 마이페이지 화면입니다.
 * 계정 정보, 활동 요약, 로컬 알림 설정, 로그아웃을 한 곳에서 다루며
 * 서버에 없는 세부 알림 설정은 Zustand persist로 이 기기에만 저장합니다.
 */
import { type ReactNode, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  BellRing,
  CalendarCheck,
  ChevronRight,
  HeartPulse,
  LogOut,
  Mail,
  Moon,
  Package,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
  WalletCards,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAttendanceRecordsQuery } from "@/features/attendance/api/attendanceApi";
import { type AttendanceRecord } from "@/features/attendance/model/attendanceTypes";
import { useHomeQuery } from "@/features/home/api/homeApi";
import { useLogoutMyPageSessionMutation, useMyPageUserQuery } from "@/features/my-page/api/myPageApi";
import {
  type MyPageNotificationSettingKey,
  useMyPageSettingsStore,
} from "@/features/my-page/model/myPageSettingsStore";
import { AppBottomNavigation } from "@/features/navigation/AppBottomNavigation";
import { routes } from "@/routes/paths";
import { getUserFacingErrorMessage } from "@/shared/api";
import { AppShell, Button, Card, Header, StarPieceAmount, Tag, useToast } from "@/shared/ui";
import { useAuthStore } from "@/stores/authStore";

import "./MyPage.css";

export function MyPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const clearSession = useAuthStore((state) => state.clearSession);
  const userQuery = useMyPageUserQuery();
  const homeQuery = useHomeQuery();
  const { year, month } = useMemo(() => getCurrentYearMonth(), []);
  const attendanceQuery = useAttendanceRecordsQuery(year, month);
  const logoutMutation = useLogoutMyPageSessionMutation();

  const notificationSettings = useMyPageSettingsStore();
  const currentStreak = useMemo(
    () => getCurrentStreak(attendanceQuery.data?.records ?? []),
    [attendanceQuery.data?.records],
  );
  const pageError = userQuery.error ?? homeQuery.error ?? attendanceQuery.error ?? null;

  /** 서버 로그아웃 확인 실패와 관계없이 이 기기의 토큰과 query cache는 반드시 정리합니다. */
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: (_data, error) => {
        // 로그아웃 API 확인이 실패해도 이 기기의 토큰은 남기지 않도록 클라이언트 세션을 먼저 정리한다.
        clearSession();
        queryClient.clear();
        showToast(
          error
            ? "서버 로그아웃 확인은 실패했지만 이 기기의 세션은 정리했어요."
            : "로그아웃했어요.",
        );
        navigate(routes.login, { replace: true });
      },
    });
  };

  /** 마이페이지 알림 설정 store의 boolean 값을 토글합니다. */
  const handleToggleSetting = (key: MyPageNotificationSettingKey) => {
    notificationSettings.toggleNotificationSetting(key);
  };

  if (userQuery.isLoading || homeQuery.isLoading || attendanceQuery.isLoading) {
    return <MyPageLoadingPage />;
  }

  if (pageError || !userQuery.data || !homeQuery.data) {
    return (
      <MyPageFrame>
        <div className="my-page__state">
          <h2>마이페이지를 불러오지 못했어요.</h2>
          <p>{getUserFacingErrorMessage(pageError)}</p>
          <Button
            onClick={() => {
              void userQuery.refetch();
              void homeQuery.refetch();
              void attendanceQuery.refetch();
            }}
          >
            다시 불러오기
          </Button>
        </div>
      </MyPageFrame>
    );
  }

  const user = userQuery.data;
  const home = homeQuery.data;
  const notificationsEnabled = notificationSettings.enabled;

  return (
    <MyPageFrame>
      <div className="my-page__body">
        {/* SCR-021 프로필: users/me API에는 이미지 필드가 없어 MVP에서는 기본 아바타와 계정 정보를 우선 노출한다. */}
        <Card className="my-page__profile-card">
          <div className="my-page__avatar" aria-hidden="true">
            <UserRound size={34} strokeWidth={1.6} />
          </div>
          <div className="my-page__profile-info">
            <span className="my-page__eyebrow">내 계정</span>
            <h2>{user.nickname}</h2>
            <p>
              <Mail size={15} strokeWidth={1.8} />
              {maskEmail(user.email)}
            </p>
            <div className="my-page__tag-row">
              <Tag variant="primary">Google</Tag>
              <Tag variant="neutral">{getUserStatusLabel(user.status)}</Tag>
            </div>
          </div>
        </Card>

        <section className="my-page__section" aria-labelledby="my-page-summary-title">
          <SectionHeading
            eyebrow=""
            title="오늘의 별친구 상태"
          />
          <div className="my-page__summary-grid">
            <SummaryButton
              icon={<WalletCards size={20} strokeWidth={1.8} />}
              label="보유 별조각"
              value={<StarPieceAmount amount={home.wallet.starPiece} size="sm" />}
              onClick={() => navigate(routes.wallet)}
            />
            <SummaryButton
              icon={<CalendarCheck size={20} strokeWidth={1.8} />}
              label="연속 출석"
              value={`${currentStreak}일`}
              onClick={() => navigate(routes.attendance)}
            />
            <SummaryButton
              icon={<Bell size={20} strokeWidth={1.8} />}
              label="읽지 않은 알림"
              value={`${home.notifications.unreadCount}개`}
              onClick={() => navigate(routes.notifications)}
            />
            <SummaryButton
              icon={<Sparkles size={20} strokeWidth={1.8} />}
              label="내 별친구"
              value={home.character?.name ?? "아직 없음"}
              onClick={() => navigate(routes.character)}
            />
          </div>
        </section>

        <section className="my-page__section" aria-labelledby="my-page-settings-title">
          <SectionHeading
            eyebrow=""
            title="내 리듬에 맞추기"
          />
          <Card className="my-page__settings-card">
            {/* 세부 설정은 서버 저장 API가 생기기 전까지 localStorage에만 보관한다. */}
            <SettingToggle
              checked={notificationSettings.enabled}
              description="앱 안에서 받는 알림을 한 번에 켜거나 꺼요."
              icon={<BellRing size={20} strokeWidth={1.8} />}
              label="전체 알림"
              onChange={() => handleToggleSetting("enabled")}
            />
            <SettingToggle
              checked={notificationsEnabled && notificationSettings.missionOffer}
              description="새 미션 제안과 미션 흐름 알림을 받아요."
              disabled={!notificationsEnabled}
              icon={<Target size={20} strokeWidth={1.8} />}
              label="미션 제안 알림"
              onChange={() => handleToggleSetting("missionOffer")}
            />
            <SettingToggle
              checked={notificationsEnabled && notificationSettings.characterState}
              description="배고픔, 피로도처럼 상태가 나빠질 때 알려줘요."
              disabled={!notificationsEnabled}
              icon={<HeartPulse size={20} strokeWidth={1.8} />}
              label="상태 알림"
              onChange={() => handleToggleSetting("characterState")}
            />
            <SettingToggle
              checked={notificationsEnabled && notificationSettings.dailyReminder}
              description="하루에 한 번 출석과 미션을 잊지 않게 알려줘요."
              disabled={!notificationsEnabled}
              icon={<CalendarCheck size={20} strokeWidth={1.8} />}
              label="일일 리마인더"
              onChange={() => handleToggleSetting("dailyReminder")}
            />
            <SettingToggle
              checked={notificationsEnabled && notificationSettings.quietHoursEnabled}
              description="정한 시간에는 알림을 조용히 묶어둘게요."
              disabled={!notificationsEnabled}
              icon={<Moon size={20} strokeWidth={1.8} />}
              label="방해 금지 시간"
              onChange={() => handleToggleSetting("quietHoursEnabled")}
            />
            <div className="my-page__time-row" aria-label="방해 금지 시간대">
              <label>
                <span>시작</span>
                <input
                  disabled={!notificationsEnabled || !notificationSettings.quietHoursEnabled}
                  onChange={(event) =>
                    notificationSettings.setQuietHours({ start: event.currentTarget.value })
                  }
                  type="time"
                  value={notificationSettings.quietHoursStart}
                />
              </label>
              <label>
                <span>종료</span>
                <input
                  disabled={!notificationsEnabled || !notificationSettings.quietHoursEnabled}
                  onChange={(event) =>
                    notificationSettings.setQuietHours({ end: event.currentTarget.value })
                  }
                  type="time"
                  value={notificationSettings.quietHoursEnd}
                />
              </label>
            </div>
          </Card>
        </section>

        <section className="my-page__section" aria-labelledby="my-page-links-title">
          <SectionHeading
            eyebrow=""
            title="자주 보는 메뉴"
          />
          <Card className="my-page__link-list">
            <LinkRow
              description="별조각 잔액 확인"
              icon={<WalletCards size={20} strokeWidth={1.8} />}
              label="별조각"
              onClick={() => navigate(routes.wallet)}
            />
            <LinkRow
              description="보유 스킨과 장착 상태 확인"
              icon={<Package size={20} strokeWidth={1.8} />}
              label="보관함"
              onClick={() => navigate(routes.inventory)}
            />
            <LinkRow
              description="읽지 않은 알림과 상태 알림 확인"
              icon={<Bell size={20} strokeWidth={1.8} />}
              label="알림함"
              onClick={() => navigate(routes.notifications)}
            />
          </Card>
        </section>

        <section className="my-page__section my-page__section--account" aria-label="계정">
          <Card className="my-page__account-card">
            <span className="my-page__account-icon" aria-hidden="true">
              <ShieldCheck size={20} strokeWidth={1.8} />
            </span>
            <div className="my-page__account-copy">
              <span className="my-page__eyebrow">계정</span>
              <strong>로그인 세션 관리</strong>
              <p>이 기기에서 Polaris 접속 상태를 정리해요.</p>
            </div>
            <Button
              disabled={logoutMutation.isPending}
              onClick={handleLogout}
              size="compact"
              variant="secondary"
            >
              <LogOut size={18} strokeWidth={1.9} />
              {logoutMutation.isPending ? "로그아웃 중..." : "로그아웃"}
            </Button>
          </Card>
          <div className="my-page__version">
            <ShieldCheck size={15} strokeWidth={1.8} />
            Polaris 0.1.0
          </div>
        </section>
      </div>
    </MyPageFrame>
  );
}

/** 마이페이지의 헤더, 하단 탭, 모바일 shell을 묶습니다. */
function MyPageFrame({ children }: { children: ReactNode }) {
  return (
    <main className="my-page">
      <AppShell>
        <Header title="마이페이지" />
        {children}
        <AppBottomNavigation />
      </AppShell>
    </main>
  );
}

/** 계정/홈/출석 요약을 불러오는 동안 표시하는 skeleton 화면입니다. */
function MyPageLoadingPage() {
  return (
    <MyPageFrame>
      <div className="my-page__body">
        <div className="my-page__skeleton my-page__skeleton--profile" />
        <div className="my-page__summary-grid">
          <div className="my-page__skeleton my-page__skeleton--summary" />
          <div className="my-page__skeleton my-page__skeleton--summary" />
          <div className="my-page__skeleton my-page__skeleton--summary" />
          <div className="my-page__skeleton my-page__skeleton--summary" />
        </div>
        <div className="my-page__skeleton my-page__skeleton--settings" />
      </div>
    </MyPageFrame>
  );
}

/** 섹션의 작은 eyebrow와 제목을 같은 스타일로 맞추는 보조 컴포넌트입니다. */
function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="my-page__section-head">
      <span className="my-page__eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
    </div>
  );
}

/** 활동 요약 영역에서 다른 화면으로 이동하는 요약 버튼입니다. */
function SummaryButton({
  icon,
  label,
  value,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  onClick: () => void;
}) {
  return (
    <button className="my-page__summary-card" onClick={onClick} type="button">
      <span className="my-page__summary-icon">{icon}</span>
      <span className="my-page__summary-copy">
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
    </button>
  );
}

/** 알림 설정 한 줄입니다. checkbox를 switch 스타일로 감싼 공통 UI입니다. */
function SettingToggle({
  checked,
  description,
  disabled = false,
  icon,
  label,
  onChange,
}: {
  checked: boolean;
  description: string;
  disabled?: boolean;
  icon: ReactNode;
  label: string;
  onChange: () => void;
}) {
  return (
    <label className={`my-page__setting-row ${disabled ? "my-page__setting-row--disabled" : ""}`}>
      <span className="my-page__setting-icon">{icon}</span>
      <span className="my-page__setting-copy">
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <span className="my-page__switch">
        <input checked={checked} disabled={disabled} onChange={onChange} type="checkbox" />
        <span aria-hidden="true" />
      </span>
    </label>
  );
}

/** 마이페이지 하단 바로가기 목록의 한 줄입니다. */
function LinkRow({
  description,
  icon,
  label,
  onClick,
}: {
  description: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button className="my-page__link-row" onClick={onClick} type="button">
      <span className="my-page__link-icon">{icon}</span>
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <ChevronRight size={18} strokeWidth={1.8} />
    </button>
  );
}

/** 현재 출석 요약 조회에 필요한 연도와 월을 계산합니다. */
function getCurrentYearMonth() {
  const now = new Date();

  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
}

/** 오늘 또는 어제의 최신 출석 기록을 기준으로 현재 연속 출석일을 계산합니다. */
function getCurrentStreak(records: AttendanceRecord[]) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const todayKey = formatDateKey(today);
  const yesterdayKey = formatDateKey(yesterday);
  const latestRecord = [...records].sort((a, b) => b.attendanceDate.localeCompare(a.attendanceDate))[0];

  if (!latestRecord) return 0;
  if (latestRecord.attendanceDate !== todayKey && latestRecord.attendanceDate !== yesterdayKey) return 0;

  return latestRecord.streakCount;
}

/** Date를 출석 API 날짜 키 yyyy-MM-dd로 변환합니다. */
function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/** 개인정보 노출을 줄이기 위해 이메일 local-part 일부를 마스킹합니다. */
function maskEmail(email: string) {
  const [localPart, domain] = email.split("@");

  if (!localPart || !domain) return email;

  const prefix = localPart.slice(0, Math.min(2, localPart.length));

  return `${prefix}${"*".repeat(Math.max(3, localPart.length - prefix.length))}@${domain}`;
}

/** 백엔드 사용자 상태값을 마이페이지에 보이는 한국어 라벨로 바꿉니다. */
function getUserStatusLabel(status: string) {
  if (status === "ACTIVE") return "활성 계정";
  if (status === "INACTIVE") return "휴면 계정";
  if (status === "DELETED") return "탈퇴 처리";

  return status;
}
