import { type ReactNode, useMemo, useState } from "react";
import {
  Copy,
  ImagePlus,
  MessageSquareText,
  Share2,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { toCharacterKey } from "@/entities/character/types";
import { useHomeQuery } from "@/features/home/api/homeApi";
import { useTodayMissionsQuery } from "@/features/mission/api/missionApi";
import { AppBottomNavigation } from "@/features/navigation/AppBottomNavigation";
import {
  useCreateShareCardFlowMutation,
  useCreateShareEventMutation,
  useTodayShareStatusQuery,
} from "@/features/share/api/shareApi";
import { type ShareCardResponse, type SharePlatform, type ShareType } from "@/features/share/model/shareTypes";
import { routes } from "@/routes/paths";
import { getUserFacingErrorMessage } from "@/shared/api";
import { createIdempotencyKey } from "@/shared/api/idempotency";
import { characterAssets, emptyStateAssets } from "@/shared/assets/polarisAssets";
import { AppShell, Button, Card, Header, Tag, useToast } from "@/shared/ui";

import "./ShareCardPage.css";

const HEADLINE_MAX_LENGTH = 100;
const presetMessages = [
  "오늘도 조금 반짝였어요.",
  "작은 미션 하나가 하루를 바꿨어요.",
  "별친구와 오늘의 루틴을 지켰어요.",
];

export function ShareCardPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [headline, setHeadline] = useState(presetMessages[0]);
  const [shareCard, setShareCard] = useState<ShareCardResponse | null>(null);
  const homeQuery = useHomeQuery();
  const todayMissionsQuery = useTodayMissionsQuery();
  const todayShareStatusQuery = useTodayShareStatusQuery();
  const createShareCardMutation = useCreateShareCardFlowMutation();
  const createShareEventMutation = useCreateShareEventMutation();
  const home = homeQuery.data;
  const todayMissions = todayMissionsQuery.data;
  const todayShareStatus = todayShareStatusQuery.data;
  const characterKey = toCharacterKey(home?.character.characterTypeCode);
  const characterImageUrl = characterAssets[characterKey].happy;
  const completedCount = todayMissions?.completedCount ?? 0;
  const earnedStarPiece = useMemo(
    () =>
      todayMissions?.missions
        .filter((mission) => mission.status === "COMPLETED")
        .reduce((sum, mission) => sum + mission.rewardStarPiece, 0) ?? 0,
    [todayMissions?.missions],
  );
  const statusError = homeQuery.error ?? todayMissionsQuery.error ?? todayShareStatusQuery.error ?? null;
  const loading = homeQuery.isLoading || todayMissionsQuery.isLoading || todayShareStatusQuery.isLoading;
  const trimmedHeadline = headline.trim();
  const canCreateCard = Boolean(home && trimmedHeadline);

  const handleCreateShareCard = async () => {
    if (!home || !trimmedHeadline) return;

    try {
      const imageBlob = await createShareCardImageBlob({
        characterName: home.character.name,
        completedCount,
        earnedStarPiece,
        headline: trimmedHeadline,
      });

      createShareCardMutation.mutate(
        {
          characterId: home.character.id,
          imageBlob,
        },
        {
          onSuccess: (card) => {
            setShareCard(card);
            showToast("공유 카드가 준비됐어요.");
          },
          onError: (error) => {
            showToast(getUserFacingErrorMessage(error));
          },
        },
      );
    } catch (error) {
      showToast(getUserFacingErrorMessage(error));
    }
  };

  const handleShareCard = async () => {
    if (!shareCard) {
      showToast("공유 카드를 먼저 만들어 주세요.");
      return;
    }

    try {
      const shareResult = await shareOrCopyLink({
        headline: trimmedHeadline,
        shareUrl: shareCard.shareUrl,
      });

      createShareEventMutation.mutate(
        {
          shareCardId: shareCard.shareCardId,
          platform: shareResult.platform,
          shareType: shareResult.shareType,
          idempotencyKey: createIdempotencyKey(`share-card:${shareCard.shareCardId}`),
        },
        {
          onSuccess: (result) => {
            showToast(
              result.rewardPaid
                ? `공유 완료! 별조각 ${result.rewardStarPiece}개를 받았어요.`
                : "공유 완료! 오늘 보상은 이미 받았어요.",
            );
          },
          onError: (error) => {
            showToast(getUserFacingErrorMessage(error));
          },
        },
      );
    } catch (error) {
      showToast(getUserFacingErrorMessage(error));
    }
  };

  if (loading) {
    return <ShareCardLoadingPage />;
  }

  if (statusError || !home || !todayMissions || !todayShareStatus) {
    return (
      <ShareCardFrame>
        <div className="share-card-page__state">
          <h2>공유 카드 정보를 불러오지 못했어요.</h2>
          <p>{getUserFacingErrorMessage(statusError)}</p>
          <Button
            onClick={() => {
              void homeQuery.refetch();
              void todayMissionsQuery.refetch();
              void todayShareStatusQuery.refetch();
            }}
          >
            다시 불러오기
          </Button>
        </div>
      </ShareCardFrame>
    );
  }

  return (
    <ShareCardFrame>
      <div className="share-card-page__body">
        <section className="share-card-page__section" aria-labelledby="share-card-preview-title">
          <div className="share-card-page__section-head">
            <span className="share-card-page__eyebrow">카드 미리보기</span>
            <h2 id="share-card-preview-title">별친구와 함께한 하루</h2>
          </div>

          <div className="share-card-page__preview" aria-label="공유 카드 미리보기">
            <div className="share-card-page__preview-pattern" />
            <span className="share-card-page__preview-mark">Polaris</span>
            <img alt="" src={characterImageUrl} />
            <strong>{home.character.name}</strong>
            <p>{trimmedHeadline || "오늘의 반짝였던 마음을 적어주세요."}</p>
            <div className="share-card-page__preview-stats">
              <span>
                <small>완료 미션</small>
                <b>{completedCount}개</b>
              </span>
              <span>
                <small>오늘 별조각</small>
                <b>+{earnedStarPiece}</b>
              </span>
            </div>
          </div>
        </section>

        <section className="share-card-page__section" aria-labelledby="share-card-message-title">
          <div className="share-card-page__section-head">
            <span className="share-card-page__eyebrow">한 줄 메시지</span>
            <h2 id="share-card-message-title">카드에 남길 말</h2>
          </div>

          <div className="share-card-page__preset-row" aria-label="추천 메시지">
            {presetMessages.map((message) => (
              <button
                className={headline === message ? "share-card-page__preset-button--active" : ""}
                key={message}
                onClick={() => setHeadline(message)}
                type="button"
              >
                {message}
              </button>
            ))}
          </div>

          <label className="share-card-page__message-field">
            <span>
              <MessageSquareText size={16} strokeWidth={1.8} />
              메시지
            </span>
            <textarea
              maxLength={HEADLINE_MAX_LENGTH}
              onChange={(event) => {
                setHeadline(event.currentTarget.value);
                setShareCard(null);
              }}
              placeholder="오늘의 반짝였던 마음을 카드에 적어주세요."
              value={headline}
            />
            <small>{headline.length}/{HEADLINE_MAX_LENGTH}</small>
          </label>
        </section>

        {shareCard ? (
          <Card className="share-card-page__link-card">
            <Sparkles size={20} strokeWidth={1.8} />
            <span>
              <strong>공유 링크가 준비됐어요.</strong>
              <small>{shareCard.shareUrl}</small>
            </span>
            <Tag variant="primary">생성 완료</Tag>
          </Card>
        ) : (
          <Card className="share-card-page__empty-card">
            <img
              alt=""
              className="share-card-page__empty-illustration"
              src={emptyStateAssets.share}
            />
            <span>
              <strong>아직 공유 링크가 없어요.</strong>
              <small>카드를 만들면 여기서 바로 공유할 수 있어요.</small>
            </span>
          </Card>
        )}

        <div className="share-card-page__actions">
          <Button
            disabled={!canCreateCard || createShareCardMutation.isPending}
            onClick={handleCreateShareCard}
            variant={shareCard ? "secondary" : "primary"}
          >
            <ImagePlus size={18} strokeWidth={1.9} />
            {createShareCardMutation.isPending ? "카드 만드는 중..." : shareCard ? "카드 다시 만들기" : "공유 카드 만들기"}
          </Button>
          <Button
            disabled={!shareCard || createShareEventMutation.isPending}
            onClick={handleShareCard}
            variant="secondary"
          >
            {canUseWebShare() ? <Share2 size={18} strokeWidth={1.9} /> : <Copy size={18} strokeWidth={1.9} />}
            {createShareEventMutation.isPending ? "공유 기록 중..." : canUseWebShare() ? "공유하기" : "링크 복사하고 보상 받기"}
          </Button>
        </div>
      </div>
    </ShareCardFrame>
  );
}

function ShareCardFrame({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  return (
    <main className="share-card-page">
      <AppShell>
        <Header title="공유 카드" onBack={() => navigate(routes.home)} />
        {children}
        <AppBottomNavigation />
      </AppShell>
    </main>
  );
}

function ShareCardLoadingPage() {
  return (
    <ShareCardFrame>
      <div className="share-card-page__body">
        <div className="share-card-page__skeleton share-card-page__skeleton--preview" />
        <div className="share-card-page__skeleton share-card-page__skeleton--field" />
      </div>
    </ShareCardFrame>
  );
}

async function createShareCardImageBlob({
  characterName,
  completedCount,
  earnedStarPiece,
  headline,
}: {
  characterName: string;
  completedCount: number;
  earnedStarPiece: number;
  headline: string;
}) {
  const canvas = document.createElement("canvas");
  const width = 1080;
  const height = 1350;
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("공유 카드 이미지를 만들 수 없어요.");
  }

  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#fff8ec");
  gradient.addColorStop(0.52, "#f8e7d8");
  gradient.addColorStop(1, "#dff4e6");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  context.fillStyle = "rgba(255, 255, 255, 0.68)";
  roundedRect(context, 90, 90, 900, 1170, 60);
  context.fill();

  context.fillStyle = "#8f4b3c";
  context.font = "700 42px sans-serif";
  context.fillText("Polaris", 150, 180);

  context.fillStyle = "#f4d7c9";
  context.beginPath();
  context.arc(540, 420, 150, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#5c332a";
  context.font = "900 92px sans-serif";
  context.textAlign = "center";
  context.fillText(characterName, 540, 665);

  context.font = "700 46px sans-serif";
  wrapCanvasText(context, headline, 540, 760, 720, 64);

  context.fillStyle = "#fff4dc";
  roundedRect(context, 190, 950, 300, 150, 36);
  context.fill();
  roundedRect(context, 590, 950, 300, 150, 36);
  context.fill();

  context.fillStyle = "#7a4a22";
  context.font = "700 34px sans-serif";
  context.fillText("완료 미션", 340, 1008);
  context.fillText("오늘 별조각", 740, 1008);
  context.font = "900 54px sans-serif";
  context.fillText(`${completedCount}개`, 340, 1070);
  context.fillText(`+${earnedStarPiece}`, 740, 1070);
  context.textAlign = "left";

  // MVP에서는 별도 DOM 캡처 라이브러리 없이 canvas PNG를 만들어 presigned URL에 업로드한다.
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error("공유 카드 이미지 변환에 실패했어요."));
    }, "image/png");
  });
}

async function shareOrCopyLink({
  headline,
  shareUrl,
}: {
  headline: string;
  shareUrl: string;
}): Promise<{ platform: SharePlatform; shareType: ShareType }> {
  if (canUseWebShare()) {
    await navigator.share({
      title: "Polaris 공유 카드",
      text: headline,
      url: shareUrl,
    });

    return {
      platform: "WEB_SHARE",
      shareType: "WEB_SHARE_API",
    };
  }

  // MVP 공유 보상은 외부 게시 성공 검증 없이 공유 시도 기준이라, 클립보드 권한 실패가 보상 기록을 막지 않는다.
  await copyShareUrl(shareUrl);

  return {
    platform: "CLIPBOARD",
    shareType: "LINK_COPY",
  };
}

function canUseWebShare() {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

async function copyShareUrl(shareUrl: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await Promise.race([
        navigator.clipboard.writeText(shareUrl),
        new Promise<never>((_, reject) => {
          window.setTimeout(() => reject(new Error("clipboard-timeout")), 1200);
        }),
      ]);
      return true;
    } catch {
      // 일부 인앱 브라우저는 Clipboard API 권한 응답이 늦어서 textarea 기반 복사로 한 번 더 시도한다.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = shareUrl;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  let copied = false;

  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }

  document.body.removeChild(textarea);

  return copied;
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function wrapCanvasText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word;
    const metrics = context.measureText(testLine);

    if (metrics.width > maxWidth && line) {
      context.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
      return;
    }

    line = testLine;
  });

  if (line) {
    context.fillText(line, x, currentY);
  }
}
