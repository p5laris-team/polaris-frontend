import { type InputHTMLAttributes } from "react";

import "./TextField.css";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

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
