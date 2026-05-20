import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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
