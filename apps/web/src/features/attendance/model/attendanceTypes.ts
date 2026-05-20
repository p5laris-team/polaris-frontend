export type AttendanceRecord = {
  id: number;
  attendanceDate: string;
  rewardStarPiece: number;
  streakCount: number;
};

export type AttendanceRecordsRequest = {
  year: number;
  month: number;
};

export type AttendanceRecordsResponse = {
  records: AttendanceRecord[];
};

export type CreateAttendanceRecordResponse = AttendanceRecord;
