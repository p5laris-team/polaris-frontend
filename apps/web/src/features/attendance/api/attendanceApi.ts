import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { homeQueryKeys } from "@/features/home/api/homeApi";
import {
  demoCreateAttendanceRecord,
  demoGetAttendanceRecords,
} from "@/features/attendance/model/attendanceFixtures";
import {
  type AttendanceRecordsRequest,
  type AttendanceRecordsResponse,
  type CreateAttendanceRecordResponse,
} from "@/features/attendance/model/attendanceTypes";
import { apiClient, unwrapApiResponse } from "@/shared/api";
import { runtimeConfig } from "@/shared/config/env";

export const attendanceQueryKeys = {
  all: ["attendance"] as const,
  month: (year: number, month: number) => [...attendanceQueryKeys.all, year, month] as const,
};

export function getAttendanceRecords(params: AttendanceRecordsRequest) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoGetAttendanceRecords(params));
  }

  return unwrapApiResponse<AttendanceRecordsResponse>(
    apiClient.get("/api/attendance/v1/attendance-records", { params }),
  );
}

export function createAttendanceRecord() {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoCreateAttendanceRecord());
  }

  // API 명세상 출석 생성은 빈 body이며, 멱등성 키 위치가 별도 정의되어 있지 않아 endpoint 그대로 호출한다.
  return unwrapApiResponse<CreateAttendanceRecordResponse>(
    apiClient.post("/api/attendance/v1/attendance-records", {}),
  );
}

export function useAttendanceRecordsQuery(year: number, month: number) {
  return useQuery({
    queryKey: attendanceQueryKeys.month(year, month),
    queryFn: () => getAttendanceRecords({ year, month }),
  });
}

export function useCreateAttendanceRecordMutation(year: number, month: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAttendanceRecord,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: attendanceQueryKeys.month(year, month) }),
        queryClient.invalidateQueries({ queryKey: homeQueryKeys.summary() }),
      ]);
    },
  });
}
