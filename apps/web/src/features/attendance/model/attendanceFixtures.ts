import { demoApplyAttendanceReward } from "@/features/home/model/homeFixture";
import {
  type AttendanceRecord,
  type AttendanceRecordsRequest,
  type AttendanceRecordsResponse,
  type CreateAttendanceRecordResponse,
} from "@/features/attendance/model/attendanceTypes";

const ATTENDANCE_REWARD_STAR_PIECE = 10;

const today = getLocalDate();
let nextAttendanceRecordId = 4;

let demoAttendanceRecords: AttendanceRecord[] = [
  createSeedRecord(1, -3, 1),
  createSeedRecord(2, -2, 2),
  createSeedRecord(3, -1, 3),
].filter((record) => record.attendanceDate.slice(0, 7) === formatDateKey(today).slice(0, 7));

export function demoGetAttendanceRecords({
  year,
  month,
}: AttendanceRecordsRequest): AttendanceRecordsResponse {
  const monthPrefix = `${year}-${String(month).padStart(2, "0")}`;

  return {
    records: demoAttendanceRecords
      .filter((record) => record.attendanceDate.startsWith(monthPrefix))
      .sort((a, b) => a.attendanceDate.localeCompare(b.attendanceDate)),
  };
}

export function demoCreateAttendanceRecord(): CreateAttendanceRecordResponse {
  const attendanceDate = formatDateKey(getLocalDate());
  const alreadyCheckedToday = demoAttendanceRecords.some(
    (record) => record.attendanceDate === attendanceDate,
  );

  if (alreadyCheckedToday) {
    throw new Error("오늘 출석은 이미 완료했어요.");
  }

  const record: AttendanceRecord = {
    id: nextAttendanceRecordId,
    attendanceDate,
    rewardStarPiece: ATTENDANCE_REWARD_STAR_PIECE,
    streakCount: calculateNextStreak(attendanceDate),
  };

  nextAttendanceRecordId += 1;
  demoAttendanceRecords = [...demoAttendanceRecords, record];
  demoApplyAttendanceReward({ rewardStarPiece: record.rewardStarPiece });

  return record;
}

export function getDemoTodayDateKey() {
  return formatDateKey(getLocalDate());
}

function createSeedRecord(id: number, dayOffset: number, streakCount: number): AttendanceRecord {
  const date = getLocalDate();
  date.setDate(date.getDate() + dayOffset);

  return {
    id,
    attendanceDate: formatDateKey(date),
    rewardStarPiece: ATTENDANCE_REWARD_STAR_PIECE,
    streakCount,
  };
}

function calculateNextStreak(attendanceDate: string) {
  const previousDate = parseDateKey(attendanceDate);
  previousDate.setDate(previousDate.getDate() - 1);
  const previousDateKey = formatDateKey(previousDate);
  const previousRecord = demoAttendanceRecords.find(
    (record) => record.attendanceDate === previousDateKey,
  );

  return previousRecord ? previousRecord.streakCount + 1 : 1;
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
