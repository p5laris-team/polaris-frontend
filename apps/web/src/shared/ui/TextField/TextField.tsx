/**
 * 라벨, 힌트, 에러 메시지를 함께 다루는 공통 input 컴포넌트입니다.
 * 온보딩 이름 입력처럼 기본 텍스트 입력이 필요한 화면에서 사용합니다.
 */
import { type InputHTMLAttributes } from "react";

import "./TextField.css";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

/** error가 있으면 aria-invalid와 에러 스타일을 같이 적용합니다. */
export function TextField({ id, label, hint, error, className = "", ...props }: TextFieldProps) {
  const inputId = id ?? props.name;

  return (
    <label className={`text-field ${className}`.trim()} htmlFor={inputId}>
      {label ? <span className="text-field__label">{label}</span> : null}
      <input className="text-field__input" id={inputId} aria-invalid={Boolean(error)} {...props} />
      {hint || error ? (
        <span className={`text-field__hint ${error ? "text-field__hint--error" : ""}`}>{error ?? hint}</span>
      ) : null}
    </label>
  );
}
