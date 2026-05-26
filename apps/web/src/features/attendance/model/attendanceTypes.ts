/**
 * 출석 체크 API 타입입니다.
 * 월간 기록 조회와 오늘 출석 생성 응답이 같은 AttendanceRecord 형태를 공유합니다.
 */

/** 출석 기록 한 건입니다. streakCount는 해당 날짜 기준 연속 출석일입니다. */
export type AttendanceRecord = {
  id: number;
  attendanceDate: string;
  rewardStarPiece: number;
  streakCount: number;
};

/** 특정 연월의 출석 기록 조회 요청입니다. */
export type AttendanceRecordsRequest = {
  year: number;
  month: number;
};

/** 월간 출석 기록 응답입니다. */
export type AttendanceRecordsResponse = {
  records: AttendanceRecord[];
};

/** 오늘 출석 생성 결과입니다. 생성된 출석 기록 자체를 돌려받습니다. */
export type CreateAttendanceRecordResponse = AttendanceRecord;
