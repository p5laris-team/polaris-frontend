/**
 * 확인/취소가 있는 공통 모달입니다.
 * 상점 구매 확인처럼 사용자의 최종 결정을 한 번 더 받는 흐름에서 사용합니다.
 */
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

/** open=false일 때는 렌더링하지 않고, 배경 클릭 시 취소 핸들러가 있으면 닫습니다. */
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
