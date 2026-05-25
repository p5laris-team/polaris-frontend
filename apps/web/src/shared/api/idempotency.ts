/**
 * 구매, 돌봄, 공유처럼 같은 요청이 두 번 처리되면 안 되는 API에 붙일 멱등성 키를 만듭니다.
 * scope에는 어떤 기능의 요청인지 적고, 뒤에는 브라우저에서 만든 랜덤 값을 붙입니다.
 */
export function createIdempotencyKey(scope: string) {
  const randomPart =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  // 돌봄/공유/구매처럼 중복 처리 위험이 있는 요청에서 scope를 붙여 추적하기 쉽게 만든다.
  return `${scope}:${randomPart}`;
}
