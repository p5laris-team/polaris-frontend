/**
 * 공개 공유 카드 링크 화면입니다.
 * 로그인 보호 없이 shareId로 카드 이미지를 조회하고, 링크 방문을 백엔드에 기록합니다.
 */
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import { Copy, ExternalLink, Sparkles } from "lucide-react";
import { useParams } from "react-router-dom";

import { recordShareClick, useShareLinkQuery } from "@/features/share/api/shareApi";
import { routes } from "@/routes/paths";
import { getUserFacingErrorMessage } from "@/shared/api";
import {
  brandAssets,
  emptyStateAssets,
  shareCardAssets,
} from "@/shared/assets/polarisAssets";
import { AppShell, Button, ErrorState, Tag, useToast } from "@/shared/ui";

import "./PublicSharePage.css";

export function PublicSharePage() {
  const { shareId = "" } = useParams();
  const { showToast } = useToast();
  const shareLinkQuery = useShareLinkQuery(shareId || null);
  const shareLink = shareLinkQuery.data;
  const clickRecordedRef = useRef(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [shareLink?.imageUrl]);

  useEffect(() => {
    if (!shareLink || clickRecordedRef.current) return;

    clickRecordedRef.current = true;
    void recordShareClick({
      shareId: shareLink.shareId,
      referrer: document.referrer || undefined,
      utmSource: getSearchParam("utm_source"),
      utmMedium: getSearchParam("utm_medium"),
      utmCampaign: getSearchParam("utm_campaign"),
    }).catch(() => {
      // 공개 페이지에서는 로그 기록 실패가 카드 열람을 막지 않게 둔다.
    });
  }, [shareLink]);

  const handleSignupClick = () => {
    if (!shareLink) return;
    window.location.assign(shareLink.signupUrl || routes.login);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("공유 링크를 복사했어요.");
    } catch {
      showToast("링크 복사를 사용할 수 없어요.");
    }
  };

  if (shareLinkQuery.isLoading) {
    return <PublicShareLoadingPage />;
  }

  if (shareLinkQuery.isError || !shareLink) {
    return (
      <PublicShareFrame>
        <ErrorState
          className="public-share-page__state"
          description={getUserFacingErrorMessage(shareLinkQuery.error)}
          imageSrc={emptyStateAssets.share}
          onAction={() => void shareLinkQuery.refetch()}
          title="공유 카드를 열지 못했어요."
        />
      </PublicShareFrame>
    );
  }

  return (
    <PublicShareFrame showBottomAd>
      <div className="public-share-page__body">
        <header className="public-share-page__header">
          <img src={brandAssets.logoWordmark} alt="Polaris" />
          <Tag variant="accent">공유 카드</Tag>
        </header>

        <section className="public-share-page__card-stage" aria-label={`${shareLink.characterName} 공유 카드`}>
          <img className="public-share-page__deco" src={shareCardAssets.decorations.stardust} alt="" />
          {!imageFailed ? (
            <img
              className="public-share-page__card-image"
              src={shareLink.imageUrl}
              alt={`${shareLink.characterName}의 공유 카드`}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div
              className="public-share-page__fallback-card"
              style={
                {
                  "--public-share-fallback-bg": `url(${shareCardAssets.backgrounds.default})`,
                } as CSSProperties
              }
            >
              <img src={brandAssets.logoWordmark} alt="" />
              <strong>{shareLink.characterName}</strong>
              <p>{shareLink.headline}</p>
            </div>
          )}
        </section>

        <section className="public-share-page__copy" aria-labelledby="public-share-title">
          <span>
            <Sparkles size={15} strokeWidth={1.8} />
            {shareLink.characterName}의 오늘
          </span>
          <h1 id="public-share-title">{shareLink.headline}</h1>
          <p>별친구와 함께 남긴 하루의 작은 기록이에요.</p>
        </section>

        <div className="public-share-page__actions">
          <Button onClick={handleSignupClick}>
            <ExternalLink size={18} strokeWidth={1.9} />
            Polaris 시작하기
          </Button>
          <Button variant="secondary" onClick={handleCopyLink}>
            <Copy size={18} strokeWidth={1.9} />
            링크 복사
          </Button>
        </div>
      </div>
    </PublicShareFrame>
  );
}

function PublicShareFrame({
  children,
  showBottomAd = false,
}: {
  children: ReactNode;
  showBottomAd?: boolean;
}) {
  return (
    <main className="public-share-page">
      <AppShell className="public-share-page__shell" showBottomAd={showBottomAd}>{children}</AppShell>
    </main>
  );
}

function PublicShareLoadingPage() {
  return (
    <PublicShareFrame>
      <div className="public-share-page__body">
        <div className="public-share-page__skeleton public-share-page__skeleton--header" />
        <div className="public-share-page__skeleton public-share-page__skeleton--card" />
        <div className="public-share-page__skeleton public-share-page__skeleton--copy" />
      </div>
    </PublicShareFrame>
  );
}

function getSearchParam(key: string) {
  const value = new URLSearchParams(window.location.search).get(key);
  return value && value.trim() ? value : undefined;
}
