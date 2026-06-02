/**
 * 주요 화면에서 공통으로 쓰는 에러 상태 컴포넌트입니다.
 * 에러 문구, 빈 상태 일러스트, 다시 시도 버튼을 한 톤으로 묶어 화면마다 어긋나는 느낌을 줄입니다.
 */
import { type ReactNode } from "react";
import { RefreshCw } from "lucide-react";

import { emptyStateAssets } from "@/shared/assets/polarisAssets";
import { Button } from "@/shared/ui/Button/Button";
import { Card } from "@/shared/ui/Card/Card";

import "./ErrorState.css";

type ErrorStateProps = {
  title: string;
  description?: ReactNode;
  imageSrc?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

export function ErrorState({
  title,
  description,
  imageSrc = emptyStateAssets.mission,
  actionLabel = "다시 불러오기",
  onAction,
  className = "",
}: ErrorStateProps) {
  const classes = ["polaris-error-state", className].filter(Boolean).join(" ");

  return (
    <Card className={classes}>
      <span className="polaris-error-state__image-wrap" aria-hidden="true">
        <img className="polaris-error-state__image" src={imageSrc} alt="" />
      </span>
      <span className="polaris-error-state__copy">
        <strong>{title}</strong>
        {description ? <small>{description}</small> : null}
      </span>
      {onAction ? (
        <Button onClick={onAction} size="compact" variant="secondary">
          <RefreshCw size={16} strokeWidth={1.9} />
          {actionLabel}
        </Button>
      ) : null}
    </Card>
  );
}
