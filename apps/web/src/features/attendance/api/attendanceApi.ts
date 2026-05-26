/**
 * 출석 기록 조회와 오늘 출석 생성을 담당하는 API 계층입니다.
 * 출석 성공 시 홈 요약과 지갑 잔액도 바뀌므로 관련 캐시를 함께 갱신합니다.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { homeQueryKeys } from "@/features/home/api/homeApi";
import { walletQueryKeys } from "@/features/wallet/api/walletApi";
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

/** 특정 연/월의 출석 기록을 조회합니다. */
export function getAttendanceRecords(params: AttendanceRecordsRequest) {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoGetAttendanceRecords(params));
  }

  return unwrapApiResponse<AttendanceRecordsResponse>(
    apiClient.get("/api/attendance/v1/attendance-records", { params }),
  );
}

/** 오늘 출석을 생성하고 출석 보상 결과를 받아옵니다. */
export function createAttendanceRecord() {
  if (runtimeConfig.useApiFixtures) {
    return Promise.resolve(demoCreateAttendanceRecord());
  }

  // API 명세상 출석 생성은 빈 body이며, 멱등성 키 위치가 별도 정의되어 있지 않아 endpoint 그대로 호출한다.
  return unwrapApiResponse<CreateAttendanceRecordResponse>(
    apiClient.post("/api/attendance/v1/attendance-records", {}),
  );
}

/** 출석 달력 화면에서 월별 기록을 조회하는 hook입니다. */
export function useAttendanceRecordsQuery(year: number, month: number) {
  return useQuery({
    queryKey: attendanceQueryKeys.month(year, month),
    queryFn: () => getAttendanceRecords({ year, month }),
  });
}

/** 출석 생성 후 출석/홈/지갑 캐시를 갱신합니다. */
export function useCreateAttendanceRecordMutation(year: number, month: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAttendanceRecord,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: attendanceQueryKeys.month(year, month) }),
        queryClient.invalidateQueries({ queryKey: homeQueryKeys.summary() }),
        queryClient.invalidateQueries({ queryKey: walletQueryKeys.all }),
      ]);
    },
  });
}
