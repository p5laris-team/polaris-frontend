/**
 * 마이페이지 알림 설정용 클라이언트 store입니다.
 * 아직 세부 알림 설정 저장 API가 없기 때문에 localStorage에만 보관하고,
 * 서버 API가 생기면 이 파일의 persist 부분을 동기화 로직으로 확장하면 됩니다.
 */
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** 토글 가능한 알림 설정 key입니다. UI checkbox와 store 필드가 같은 이름을 사용합니다. */
export type MyPageNotificationSettingKey =
  | "enabled"
  | "missionOffer"
  | "characterState"
  | "dailyReminder"
  | "quietHoursEnabled";

type MyPageSettingsState = {
  enabled: boolean;
  missionOffer: boolean;
  characterState: boolean;
  dailyReminder: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  toggleNotificationSetting: (key: MyPageNotificationSettingKey) => void;
  setQuietHours: (range: { start?: string; end?: string }) => void;
};

/** 마이페이지 알림/방해금지 시간 설정을 저장하는 Zustand store입니다. */
export const useMyPageSettingsStore = create<MyPageSettingsState>()(
  persist(
    (set) => ({
      enabled: true,
      missionOffer: true,
      characterState: true,
      dailyReminder: true,
      quietHoursEnabled: false,
      quietHoursStart: "22:00",
      quietHoursEnd: "08:00",
      toggleNotificationSetting: (key) =>
        set((state) => ({
          [key]: !state[key],
        })),
      setQuietHours: ({ start, end }) =>
        set((state) => ({
          quietHoursStart: start ?? state.quietHoursStart,
          quietHoursEnd: end ?? state.quietHoursEnd,
        })),
    }),
    {
      name: "polaris-my-page-settings",
      // 세부 알림 설정 저장 API가 생기기 전까지는 이 기기의 로컬 설정으로만 보관한다.
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
