import { type ReactNode } from "react";

import { Button } from "@/shared/ui/Button/Button";
import "./Modal.css";

type ModalProps = {
  open: boolean;
  title?: string;
  children: ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
};

export function Modal({
  open,
  title,
  children,
  confirmText = "확인",
  cancelText = "취소",
  confirmDisabled = false,
  onConfirm,
  onCancel,
}: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel?.();
      }}
    >
      <section className="modal-card" role="dialog" aria-modal="true" aria-label={title ?? "확인"}>
        {title ? <h2 className="modal-card__title">{title}</h2> : null}
        <div className="modal-card__body">{children}</div>
        <div className="modal-card__actions">
          {onCancel ? (
            <Button variant="secondary" onClick={onCancel}>
              {cancelText}
            </Button>
          ) : null}
          <Button disabled={confirmDisabled} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </section>
    </div>
  );
}
