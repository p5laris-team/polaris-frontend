export type MyPageUserStatus = "ACTIVE" | "INACTIVE" | "DELETED";

export type MyPageUser = {
  id: number;
  email: string;
  nickname: string;
  provider: "GOOGLE";
  role: "USER";
  status: MyPageUserStatus;
};

export type LogoutResult = {
  loggedOut: boolean;
};
