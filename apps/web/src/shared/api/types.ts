export type ApiError = {
  timestamp: string;
  status: number;
  code: string;
  message: string;
  path: string;
  retryAfterSeconds?: number;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error: ApiError | null;
};

export type PageInfo = {
  nextCursor: string | number | null;
  hasNext: boolean;
  size: number;
};

export type CursorPage<T> = {
  items: T[];
  pageInfo: PageInfo;
};
