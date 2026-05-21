import { type ReactNode, useMemo } from "react";
import { Flame, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  useAttendanceRecordsQuery,
  useCreateAttendanceRecordMutation,
} from "@/features/attendance/api/attendanceApi";
import { type AttendanceRecord } from "@/features/attendance/model/attendanceTypes";
import { AppBottomNavigation } from "@/features/navigation/AppBottomNavigation";
import { routes } from "@/routes/paths";
import { getUserFacingErrorMessage } from "@/shared/api";
import { AppShell, Button, Card, Header, Tag, useToast } from "@/shared/ui";

import "./AttendancePage.css";

const weekLabels = ["일", "월", "화", "수", "목", "금", "토"];

export function AttendancePage() {
  const { showToast } = useToast();
  const today = useMemo(() => getLocalDate(), []);
  const todayKey = formatDateKey(today);
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const attendanceQuery = useAttendanceRecordsQuery(year, month);
  const createAttendanceMutation = useCreateAttendanceRecordMutation(year, month);

  const records = attendanceQuery.data?.records ?? [];
  const calendarDays = useMemo(() => buildMonthCalendar(year, month, records, todayKey), [
    month,
    records,
    todayKey,
    year,
  ]);
  const todayRecord = records.find((record) => record.attendanceDate === todayKey);
  const streakCount = calculateCurrentStreak(records, todayKey);

  const handleCheckAttendance = () => {
    createAttendanceMutation.mutate(undefined, {
      onSuccess: (record) => {
        showToast(`출석 완료! ✦ +${record.rewardStarPiece}`);
      },
      onError: (error) => {
        showToast(getUserFacingErrorMessage(error));
      },
    });
  };

  if (attendanceQuery.isLoading) {
    return <AttendanceLoadingPage />;
  }

  if (attendanceQuery.isError) {
    return (
      <AttendanceFrame>
        <div className="attendance-page__state">
          <h2>출석 기록을 못 불러왔어요.</h2>
          <p>{getUserFacingErrorMessage(attendanceQuery.error)}</p>
          <Button onClick={() => void attendanceQuery.refetch()}>다시 불러오기</Button>
        </div>
      </AttendanceFrame>
    );
  }

  return (
    <AttendanceFrame>
      <div className="attendance-page__body">
        {/* SCR-019 출석 체크: 월간 기록 조회 결과로 오늘 강조와 출석 스탬프를 계산한다. */}
        <div className="attendance-page__streak-row">
          <Card className="attendance-page__streak-card">
            <Flame size={20} strokeWidth={1.8} />
            <span>연속 출석</span>
            <strong>{streakCount}일</strong>
          </Card>
          <Card className="attendance-page__streak-card">
            <Sparkles size={20} strokeWidth={1.8} />
            <span>이번 달 도장</span>
            <strong>{records.length}개</strong>
          </Card>
        </div>

        <Card className="attendance-page__calendar-card">
          <div className="attendance-page__calendar-head">
            <h2>{month}월 달력</h2>
            <Tag variant={todayRecord ? "primary" : "neutral"}>
              {todayRecord ? "오늘 완료" : "오늘 미출석"}
            </Tag>
          </div>

          <div className="attendance-page__week-row" aria-hidden="true">
            {weekLabels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>

          <div className="attendance-page__calendar-grid" aria-label={`${month}월 출석 달력`}>
            {calendarDays.map((day) =>
              day.dateKey ? (
                <div
                  aria-label={`${day.day}일 ${day.stamped ? "출석 완료" : "미출석"}`}
                  className={[
                    "attendance-page__day",
                    day.stamped ? "attendance-page__day--stamped" : "",
                    day.today ? "attendance-page__day--today" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  key={day.dateKey}
                >
                  <span>{day.day}</span>
                  {day.stamped ? <strong>✦</strong> : null}
                </div>
              ) : (
                <div className="attendance-page__day attendance-page__day--empty" key={day.key} />
              ),
            )}
          </div>
        </Card>

        <Card className="attendance-page__reward-card">
          <div>
            <strong>{todayRecord ? "오늘의 출석 보상을 받았어요." : "오늘 출석 보상이 기다리고 있어요."}</strong>
            <p>
              {todayRecord
                ? `획득한 별조각: ✦ +${todayRecord.rewardStarPiece}`
                : "출석하면 별조각이 지급되고 별친구의 애정도도 조금 올라가요."}
            </p>
          </div>
          <Button
            disabled={Boolean(todayRecord) || createAttendanceMutation.isPending}
            onClick={handleCheckAttendance}
            size="large"
          >
            {createAttendanceMutation.isPending
              ? "도장 찍는 중..."
              : todayRecord
                ? "오늘 출석 완료 ✓"
                : "오늘 출석하기"}
          </Button>
        </Card>
      </div>
    </AttendanceFrame>
  );
}

function AttendanceFrame({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  return (
    <main className="attendance-page">
      <AppShell>
        <Header title="출석 체크" onBack={() => navigate(routes.home)} />
        {children}
        <AppBottomNavigation />
      </AppShell>
    </main>
  );
}

function AttendanceLoadingPage() {
  return (
    <AttendanceFrame>
      <div className="attendance-page__body">
        <div className="attendance-page__skeleton" />
        <div className="attendance-page__skeleton attendance-page__skeleton--calendar" />
        <div className="attendance-page__skeleton" />
      </div>
    </AttendanceFrame>
  );
}

type CalendarDay =
  | {
      key: string;
      dateKey: null;
    }
  | {
      key: string;
      dateKey: string;
      day: number;
      stamped: boolean;
      today: boolean;
    };

function buildMonthCalendar(
  year: number,
  month: number,
  records: AttendanceRecord[],
  todayKey: string,
): CalendarDay[] {
  const firstDate = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const stampedDates = new Set(records.map((record) => record.attendanceDate));
  const leadingEmptyDays = Array.from({ length: firstDate.getDay() }, (_, index) => ({
    key: `empty-${index}`,
    dateKey: null,
  }));
  const monthDays = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const dateKey = formatDateKey(new Date(year, month - 1, day));

    return {
      key: dateKey,
      dateKey,
      day,
      stamped: stampedDates.has(dateKey),
      today: dateKey === todayKey,
    };
  });

  return [...leadingEmptyDays, ...monthDays];
}

function calculateCurrentStreak(records: AttendanceRecord[], todayKey: string) {
  const todayRecord = records.find((record) => record.attendanceDate === todayKey);

  if (todayRecord) {
    return todayRecord.streakCount;
  }

  const yesterday = parseDateKey(todayKey);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = formatDateKey(yesterday);
  const yesterdayRecord = records.find((record) => record.attendanceDate === yesterdayKey);

  return yesterdayRecord?.streakCount ?? 0;
}

function getLocalDate() {
  const now = new Date();

  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
