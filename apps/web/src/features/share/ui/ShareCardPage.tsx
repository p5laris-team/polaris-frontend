/**
 * 공유 카드 생성 화면입니다.
 * 오늘 완료한 미션과 별친구 이미지를 canvas 카드로 합성하고,
 * presigned upload 이후 Web Share API 또는 클립보드 복사로 공유 보상을 기록합니다.
 */
import { type CSSProperties, type ReactNode, useEffect, useMemo, useState } from "react";
import {
  Copy,
  ImagePlus,
  MessageSquareText,
  Share2,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { toCharacterKey } from "@/entities/character/types";
import { useActiveCharacterQuery } from "@/features/character/api/characterCareApi";
import { resolveCharacterImageUrl } from "@/features/character/model/characterAssetResolver";
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
import {
  brandAssets,
  emptyStateAssets,
  shareCardAssets,
  type ShareCardBackgroundKey,
} from "@/shared/assets/polarisAssets";
import { AppShell, Button, Card, Header, StarPieceAmount, Tag, useToast } from "@/shared/ui";

import "./ShareCardPage.css";

const HEADLINE_MAX_LENGTH = 40;
const SHARE_CARD_FONT_FAMILY =
  '"SUIT Variable", "SUIT", "Pretendard Variable", "Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';

// 사용자가 바로 고를 수 있는 기본 카드 문구입니다. 직접 입력하면 이 값은 덮어씁니다.
const presetMessages = [
  "오늘도 조금 반짝였어요.",
  "작은 미션 하나가 하루를 바꿨어요.",
  "별친구와 오늘의 루틴을 지켰어요.",
];

// 배경 asset key와 화면 라벨을 함께 관리해서 미리보기와 canvas 생성이 같은 값을 사용합니다.
const shareCardBackgroundOptions: Array<{ key: ShareCardBackgroundKey; label: string }> = [
  { key: "default", label: "기본" },
  { key: "night", label: "밤하늘" },
  { key: "warm", label: "따뜻한 빛" },
];

export function ShareCardPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [headline, setHeadline] = useState(presetMessages[0]);
  const [backgroundKey, setBackgroundKey] = useState<ShareCardBackgroundKey>("default");
  const [shareCard, setShareCard] = useState<ShareCardResponse | null>(null);
  const [localRewardClaimed, setLocalRewardClaimed] = useState<boolean | null>(null);
  const homeQuery = useHomeQuery();
  const activeCharacterQuery = useActiveCharacterQuery();
  const todayMissionsQuery = useTodayMissionsQuery();
  const todayShareStatusQuery = useTodayShareStatusQuery();
  const createShareCardMutation = useCreateShareCardFlowMutation();
  const createShareEventMutation = useCreateShareEventMutation();
  const home = homeQuery.data;
  const character = home?.character ?? null;
  const todayMissions = todayMissionsQuery.data;
  const todayShareStatus = todayShareStatusQuery.data;
  const shareRewardClaimed = localRewardClaimed ?? todayShareStatus?.rewardClaimed ?? false;
  const characterKey = toCharacterKey(character?.characterTypeCode);
  const backgroundImageUrl = shareCardAssets.backgrounds[backgroundKey];
  const activeCharacter = activeCharacterQuery.data;
  const characterImageUrl = resolveCharacterImageUrl({
    character: characterKey,
    mood: "happy",
    equippedSkin: activeCharacter?.equippedSkin ?? null,
    // 공유 카드는 축하용 이미지라서 장착 스킨이 있으면 상태 수치보다 happy 스킨을 우선한다.
    // CDN 상태별 URL이 비어 있어도 엑박이 나지 않도록 카드 렌더링은 프론트 로컬 에셋을 기준으로 둔다.
    assetUrls: null,
    fallbackUrl: character?.currentAssetUrl ?? shareCardAssets.characters[characterKey],
  });
  const completedCount = todayMissions?.completedCount ?? 0;
  const earnedStarPiece = useMemo(
    () =>
      todayMissions?.missions
        .filter((mission) => mission.status === "COMPLETED")
        .reduce((sum, mission) => sum + mission.rewardStarPiece, 0) ?? 0,
    [todayMissions?.missions],
  );
  const statusError = homeQuery.error ?? todayMissionsQuery.error ?? todayShareStatusQuery.error ?? null;
  const loading =
    homeQuery.isLoading ||
    activeCharacterQuery.isLoading ||
    todayMissionsQuery.isLoading ||
    todayShareStatusQuery.isLoading;
  const trimmedHeadline = headline.trim();
  const canCreateCard = Boolean(character && trimmedHeadline);

  useEffect(() => {
    if (!todayShareStatus) return;
    setLocalRewardClaimed((previous) => previous === true || todayShareStatus.rewardClaimed);
  }, [todayShareStatus]);

  /** 현재 미리보기 상태를 canvas 이미지로 만들고 백엔드에 공유 카드 생성을 요청합니다. */
  const handleCreateShareCard = async () => {
    if (!character || !trimmedHeadline) return;

    try {
      const imageBlob = await createShareCardImageBlob({
        backgroundKey,
        backgroundImageUrl,
        brandLogoImageUrl: brandAssets.logoWordmark,
        characterName: character.name,
        characterImageUrl,
        completedCount,
        earnedStarPiece,
        friendsFrameImageUrl: shareCardAssets.decorations.friendsFrame,
        headline: trimmedHeadline,
        stampImageUrl: shareCardAssets.stamps.complete,
        stardustImageUrl: shareCardAssets.decorations.stardust,
      });

      createShareCardMutation.mutate(
        {
          characterId: character.id,
          headline: trimmedHeadline,
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

  /** 생성된 공유 카드 링크를 실제 공유하거나 복사한 뒤 보상 이벤트를 멱등키와 함께 기록합니다. */
  const handleShareCard = async () => {
    if (!shareCard) {
      showToast("공유 카드를 먼저 만들어 주세요.");
      return;
    }

    const rewardClaimedBeforeShare = shareRewardClaimed;

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
            const rewardPaidNow = !rewardClaimedBeforeShare && result.rewardPaid && result.rewardStarPiece > 0;
            setLocalRewardClaimed(true);
            showToast(
              rewardPaidNow
                ? `공유 완료! 별조각 ${result.rewardStarPiece}개를 받았어요.`
                : "공유 완료! 별조각 보상은 하루 한 번만 받을 수 있어요.",
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

  if (statusError || !character || !todayMissions || !todayShareStatus) {
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

          <div
            className={`share-card-page__preview share-card-page__preview--${backgroundKey}`}
            aria-label="공유 카드 미리보기"
            style={{ "--share-card-background": `url(${backgroundImageUrl})` } as CSSProperties}
          >
            <img
              alt=""
              className="share-card-page__preview-stardust"
              src={shareCardAssets.decorations.stardust}
            />
            <img
              alt=""
              className="share-card-page__preview-frame"
              src={shareCardAssets.decorations.friendsFrame}
            />
            <img
              alt="Polaris"
              className="share-card-page__preview-mark"
              src={brandAssets.logoWordmark}
            />
            {completedCount > 0 ? (
              <img
                alt=""
                className="share-card-page__preview-stamp"
                src={shareCardAssets.stamps.complete}
              />
            ) : null}
            <div className="share-card-page__preview-content">
              <div className="share-card-page__preview-character-wrap">
                <img
                  alt=""
                  className="share-card-page__preview-character"
                  src={characterImageUrl}
                />
              </div>
              <strong>{character.name}</strong>
              <p>{trimmedHeadline || "오늘의 반짝였던 마음을 적어주세요."}</p>
              <div className="share-card-page__preview-stats">
                <span>
                  <small>완료 미션</small>
                  <b>{completedCount}개</b>
                </span>
                <span>
                  <small>오늘 별조각</small>
                  <b>
                    <StarPieceAmount amount={earnedStarPiece} prefix="+" size="md" />
                  </b>
                </span>
              </div>
            </div>
          </div>

          <div className="share-card-page__background-row" aria-label="공유 카드 배경 선택">
            {shareCardBackgroundOptions.map((option) => (
              <button
                aria-pressed={backgroundKey === option.key}
                className={backgroundKey === option.key ? "share-card-page__background-button--active" : ""}
                key={option.key}
                onClick={() => {
                  setBackgroundKey(option.key);
                  setShareCard(null);
                }}
                type="button"
              >
                <img alt="" src={shareCardAssets.backgrounds[option.key]} />
                <span>{option.label}</span>
              </button>
            ))}
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
                onClick={() => {
                  setHeadline(message);
                  setShareCard(null);
                }}
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
            {getShareButtonLabel({
              isPending: createShareEventMutation.isPending,
              rewardClaimed: shareRewardClaimed,
              webShareAvailable: canUseWebShare(),
            })}
          </Button>
        </div>
        <p className="share-card-page__reward-note">
          {shareRewardClaimed
            ? "공유는 계속 가능해요. 별조각 보상은 하루 한 번만 받을 수 있어요."
            : "오늘 첫 공유를 하면 별조각 보상을 받을 수 있어요."}
        </p>
      </div>
    </ShareCardFrame>
  );
}

/** 공유 카드 화면의 헤더, 하단 탭, 모바일 shell을 묶습니다. */
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

/** 공유 카드에 필요한 홈/미션/보상 상태를 불러오는 동안 보여주는 skeleton입니다. */
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

/** DOM 캡처 라이브러리 없이 canvas에 배경, 캐릭터, 문구, 통계를 직접 그려 PNG Blob을 만듭니다. */
async function createShareCardImageBlob({
  backgroundKey,
  backgroundImageUrl,
  brandLogoImageUrl,
  characterName,
  characterImageUrl,
  completedCount,
  earnedStarPiece,
  friendsFrameImageUrl,
  headline,
  stampImageUrl,
  stardustImageUrl,
}: {
  backgroundKey: ShareCardBackgroundKey;
  backgroundImageUrl: string;
  brandLogoImageUrl: string;
  characterName: string;
  characterImageUrl: string;
  completedCount: number;
  earnedStarPiece: number;
  friendsFrameImageUrl: string;
  headline: string;
  stampImageUrl: string;
  stardustImageUrl: string;
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

  const [
    backgroundImage,
    brandLogoImage,
    characterImage,
    friendsFrameImage,
    stampImage,
    stardustImage,
  ] = await Promise.all([
    loadCanvasImage(backgroundImageUrl),
    loadCanvasImage(brandLogoImageUrl),
    loadCanvasImage(characterImageUrl),
    loadCanvasImage(friendsFrameImageUrl),
    loadCanvasImage(stampImageUrl),
    loadCanvasImage(stardustImageUrl),
  ]);
  await waitForCanvasFonts();

  const darkBackground = backgroundKey === "night";
  const inkColor = darkBackground ? "#fff6dc" : "#4d3025";
  const mutedColor = darkBackground ? "rgba(255, 246, 220, 0.82)" : "#7a5746";
  const pillFill = darkBackground ? "rgba(12, 24, 42, 0.62)" : "rgba(255, 255, 255, 0.72)";
  const messageBox = {
    x: 166,
    y: 800,
    width: 748,
    height: 156,
  };

  drawImageCover(context, backgroundImage, 0, 0, width, height);

  context.save();
  context.globalAlpha = darkBackground ? 0.34 : 0.42;
  drawImageContain(context, stardustImage, 128, 186, 824, 694);
  context.restore();

  context.save();
  context.globalAlpha = darkBackground ? 0.58 : 0.92;
  drawImageContain(context, friendsFrameImage, 56, 64, 968, 1228);
  context.restore();

  context.save();
  context.filter = darkBackground ? "brightness(0) invert(1)" : "none";
  drawImageContain(context, brandLogoImage, 435, 110, 210, 52);
  context.restore();

  drawImageContain(context, characterImage, 312, 252, 456, 420);

  if (completedCount > 0) {
    context.save();
    context.translate(918, 330);
    context.rotate((-9 * Math.PI) / 180);
    const stampGlow = context.createRadialGradient(0, 0, 36, 0, 0, 118);
    stampGlow.addColorStop(0, "rgba(255, 250, 235, 0.98)");
    stampGlow.addColorStop(0.56, "rgba(255, 250, 235, 0.9)");
    stampGlow.addColorStop(0.72, "rgba(255, 250, 235, 0.42)");
    stampGlow.addColorStop(1, "rgba(255, 250, 235, 0)");
    context.fillStyle = stampGlow;
    context.beginPath();
    context.arc(0, 0, 118, 0, Math.PI * 2);
    context.fill();
    drawImageContain(context, stampImage, -98, -98, 196, 196);
    context.restore();
  }

  context.fillStyle = inkColor;
  context.textAlign = "center";
  context.textBaseline = "top";
  setCanvasFont(context, 900, fitCanvasTextSize(context, characterName, 690, 76, 52, 900));
  context.fillText(characterName, 540, 694);

  context.save();
  context.shadowColor = darkBackground ? "rgba(5, 12, 24, 0.28)" : "rgba(93, 61, 30, 0.1)";
  context.shadowBlur = 24;
  context.shadowOffsetY = 10;
  context.fillStyle =
    backgroundKey === "warm"
      ? "rgba(255, 255, 255, 0.66)"
      : darkBackground
        ? "rgba(12, 24, 42, 0.58)"
        : "rgba(255, 252, 239, 0.68)";
  roundedRect(context, messageBox.x, messageBox.y, messageBox.width, messageBox.height, 38);
  context.fill();
  context.restore();

  context.fillStyle = mutedColor;
  setCanvasFont(context, 800, 43);
  drawWrappedCanvasTextInBox(context, headline, {
    x: 540,
    y: messageBox.y,
    width: 700,
    height: messageBox.height,
    lineHeight: 56,
    maxLines: 2,
  });

  drawStatPill(context, {
    fillStyle: pillFill,
    label: "완료 미션",
    labelColor: mutedColor,
    value: `${completedCount}개`,
    valueColor: inkColor,
    x: 180,
    y: 1030,
  });
  drawStatPill(context, {
    fillStyle: pillFill,
    label: "오늘 별조각",
    labelColor: mutedColor,
    value: `+${earnedStarPiece}`,
    valueColor: inkColor,
    x: 590,
    y: 1030,
  });
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

/** 브라우저가 Web Share API를 지원하면 공유창을 열고, 아니면 링크 복사 흐름으로 대체합니다. */
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

/** 현재 브라우저에서 navigator.share를 사용할 수 있는지 확인합니다. */
function canUseWebShare() {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

function getShareButtonLabel({
  isPending,
  rewardClaimed,
  webShareAvailable,
}: {
  isPending: boolean;
  rewardClaimed: boolean;
  webShareAvailable: boolean;
}) {
  if (isPending) return "공유 기록 중...";
  if (webShareAvailable) return "공유하기";
  return rewardClaimed ? "링크 복사하기" : "링크 복사하고 보상 받기";
}

/** Clipboard API 실패까지 대비해 textarea 기반 복사 fallback을 제공합니다. */
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

/** canvas에 그릴 이미지를 Promise 형태로 로드합니다. */
function loadCanvasImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("공유 카드 에셋을 불러오지 못했어요."));
    image.src = source;
  });
}

/** 웹폰트가 로드되기 전에 canvas를 그리면 배포 브라우저의 fallback 폰트 기준으로 저장될 수 있어 먼저 기다립니다. */
async function waitForCanvasFonts() {
  if (typeof document === "undefined" || !document.fonts) {
    return;
  }

  try {
    await Promise.allSettled([
      document.fonts.load(`900 76px ${SHARE_CARD_FONT_FAMILY}`),
      document.fonts.load(`800 43px ${SHARE_CARD_FONT_FAMILY}`),
      document.fonts.load(`800 34px ${SHARE_CARD_FONT_FAMILY}`),
      document.fonts.load(`900 58px ${SHARE_CARD_FONT_FAMILY}`),
    ]);
    await document.fonts.ready;
  } catch {
    // 폰트 로딩 실패는 카드 생성을 막지 않고, 명시한 fallback font stack으로 계속 그린다.
  }
}

/** canvas font 선언을 한곳에서 맞춰 미리보기 CSS와 저장 이미지의 한글 폰트 차이를 줄입니다. */
function setCanvasFont(
  context: CanvasRenderingContext2D,
  weight: number,
  size: number,
) {
  context.font = `${weight} ${size}px ${SHARE_CARD_FONT_FAMILY}`;
}

/** 긴 캐릭터 이름도 카드 폭을 넘거나 아래 문구 박스와 겹치지 않도록 글자 크기를 줄입니다. */
function fitCanvasTextSize(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  initialSize: number,
  minSize: number,
  weight: number,
) {
  let size = initialSize;
  setCanvasFont(context, weight, size);

  while (size > minSize && context.measureText(text).width > maxWidth) {
    size -= 2;
    setCanvasFont(context, weight, size);
  }

  return size;
}

/** 이미지 비율을 유지하면서 지정 영역을 빈틈없이 채웁니다. */
function drawImageCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const imageWidth = image.naturalWidth || image.width;
  const imageHeight = image.naturalHeight || image.height;
  const scale = Math.max(width / imageWidth, height / imageHeight);
  const drawWidth = imageWidth * scale;
  const drawHeight = imageHeight * scale;

  context.drawImage(
    image,
    x + (width - drawWidth) / 2,
    y + (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

/** 이미지 비율을 유지하면서 지정 영역 안에 전체가 보이도록 그립니다. */
function drawImageContain(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const imageWidth = image.naturalWidth || image.width;
  const imageHeight = image.naturalHeight || image.height;
  const scale = Math.min(width / imageWidth, height / imageHeight);
  const drawWidth = imageWidth * scale;
  const drawHeight = imageHeight * scale;

  context.drawImage(
    image,
    x + (width - drawWidth) / 2,
    y + (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

/** 공유 카드 하단의 완료 미션/별조각 통계 pill을 그립니다. */
function drawStatPill(
  context: CanvasRenderingContext2D,
  {
    fillStyle,
    label,
    labelColor,
    value,
    valueColor,
    x,
    y,
  }: {
    fillStyle: string;
    label: string;
    labelColor: string;
    value: string;
    valueColor: string;
    x: number;
    y: number;
  },
) {
  context.save();
  context.shadowColor = "rgba(39, 29, 22, 0.12)";
  context.shadowBlur = 24;
  context.shadowOffsetY = 10;
  context.fillStyle = fillStyle;
  roundedRect(context, x, y, 310, 152, 36);
  context.fill();
  context.restore();

  context.textAlign = "center";
  context.fillStyle = labelColor;
  context.textBaseline = "top";
  setCanvasFont(context, 800, 34);
  context.fillText(label, x + 155, y + 28);
  context.fillStyle = valueColor;
  setCanvasFont(context, 900, 58);
  context.fillText(value, x + 155, y + 72);
}

/** canvas에는 CSS border-radius가 없어서 둥근 사각형 path를 직접 만듭니다. */
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

/** canvas 텍스트가 카드 영역을 넘지 않도록 줄바꿈과 최대 줄 수를 계산합니다. */
function getCanvasTextLines(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines = 3,
) {
  const lines: string[] = [];
  const words = text.trim().split(/\s+/).filter(Boolean);
  let line = "";

  words.forEach((word) => {
    splitCanvasWord(context, word, maxWidth).forEach((part) => {
      const testLine = line ? `${line} ${part}` : part;
      const metrics = context.measureText(testLine);

      if (metrics.width > maxWidth && line) {
        lines.push(line);
        line = part;
        return;
      }

      line = testLine;
    });
  });

  if (line) {
    lines.push(line);
  }

  const visibleLines = lines.slice(0, maxLines);
  if (lines.length > maxLines) {
    visibleLines[visibleLines.length - 1] = trimCanvasText(
      context,
      visibleLines[visibleLines.length - 1],
      maxWidth,
    );
  }

  return visibleLines;
}

/** 메시지를 투명 박스 안에서 세로 중앙 정렬해 이름/통계 영역과 겹치지 않게 그립니다. */
function drawWrappedCanvasTextInBox(
  context: CanvasRenderingContext2D,
  text: string,
  {
    x,
    y,
    width,
    height,
    lineHeight,
    maxLines,
  }: {
    x: number;
    y: number;
    width: number;
    height: number;
    lineHeight: number;
    maxLines: number;
  },
) {
  const lines = getCanvasTextLines(context, text, width, maxLines);
  const totalTextHeight = lines.length * lineHeight;
  const top = y + Math.max(0, (height - totalTextHeight) / 2);

  context.textAlign = "center";
  context.textBaseline = "top";
  lines.forEach((line, index) => {
    context.fillText(line, x, top + index * lineHeight);
  });
}

/** 긴 단어도 canvas 폭을 넘지 않도록 글자 단위로 나눕니다. */
function splitCanvasWord(
  context: CanvasRenderingContext2D,
  word: string,
  maxWidth: number,
) {
  if (context.measureText(word).width <= maxWidth) {
    return [word];
  }

  const parts: string[] = [];
  let part = "";

  Array.from(word).forEach((character) => {
    const testPart = `${part}${character}`;

    if (context.measureText(testPart).width > maxWidth && part) {
      parts.push(part);
      part = character;
      return;
    }

    part = testPart;
  });

  if (part) {
    parts.push(part);
  }

  return parts;
}

/** 최대 줄 수를 넘은 마지막 줄은 말줄임표가 들어가도록 오른쪽에서 줄입니다. */
function trimCanvasText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  let trimmedText = text;

  while (trimmedText.length > 0 && context.measureText(`${trimmedText}...`).width > maxWidth) {
    trimmedText = trimmedText.slice(0, -1);
  }

  return `${trimmedText}...`;
}
