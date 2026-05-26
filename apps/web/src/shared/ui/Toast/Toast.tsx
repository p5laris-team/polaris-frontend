/**
 * 앱 전체에서 쓰는 toast provider와 hook입니다.
 * mutation 성공/실패처럼 짧은 사용자 피드백을 화면 하단에 일정 시간 보여줍니다.
 */
import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";

import "./Toast.css";

type ToastItem = {
  id: number;
  message: string;
};

type ToastContextValue = {
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

/** 자식 화면을 감싸고, showToast로 쌓인 메시지를 하단 viewport에 렌더링합니다. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Polaris 톤의 짧은 피드백 문구를 하단에 잠깐 띄운다.
  const showToast = useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setToasts((items) => [...items, { id, message }]);
    window.setTimeout(() => {
      setToasts((items) => items.filter((item) => item.id !== id));
    }, 2200);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-viewport" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div className="toast-message" key={toast.id}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** ToastProvider 안에서만 사용할 수 있는 toast 호출 hook입니다. */
export function useToast() {
  const value = useContext(ToastContext);
  if (!value) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return value;
}
