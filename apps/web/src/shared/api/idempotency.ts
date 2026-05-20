export function createIdempotencyKey(scope: string) {
  const randomPart =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  // 돌봄/공유/구매처럼 중복 처리 위험이 있는 요청에서 scope를 붙여 추적하기 쉽게 만든다.
  return `${scope}:${randomPart}`;
}
