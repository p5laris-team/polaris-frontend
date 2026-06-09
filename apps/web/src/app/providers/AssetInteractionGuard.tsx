import { useEffect } from "react";

const PROTECTED_ASSET_SELECTOR = [
  ".polaris-app img",
  ".polaris-app svg",
  ".polaris-app canvas",
  '.polaris-app [data-asset-protected="true"]',
].join(",");
const PROTECTED_ASSET_QUERY = 'img, svg, canvas, [data-asset-protected="true"]';

function isProtectedAssetEvent(event: Event) {
  const target = event.target;

  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(target.closest(PROTECTED_ASSET_SELECTOR));
}

function protectAssetElement(element: Element) {
  if (!element.closest(".polaris-app")) {
    return;
  }

  element.setAttribute("draggable", "false");

  if (element instanceof HTMLImageElement) {
    element.draggable = false;
  }
}

function disableAssetDragging(root: ParentNode) {
  if (root instanceof Element && root.closest(".polaris-app")) {
    if (root.matches(PROTECTED_ASSET_QUERY)) {
      protectAssetElement(root);
    }

    root.querySelectorAll(PROTECTED_ASSET_QUERY).forEach(protectAssetElement);
    return;
  }

  if (root instanceof Element) {
    root.querySelectorAll(PROTECTED_ASSET_SELECTOR).forEach(protectAssetElement);
    return;
  }

  root.querySelectorAll(PROTECTED_ASSET_SELECTOR).forEach(protectAssetElement);
}

/**
 * 앱 안에서 에셋을 실수로 끌어가거나 우클릭 저장하는 기본 브라우저 동작을 막는다.
 */
export function AssetInteractionGuard() {
  useEffect(() => {
    disableAssetDragging(document);

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            disableAssetDragging(node);
          }
        });
      });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    const preventAssetDrag = (event: DragEvent) => {
      if (isProtectedAssetEvent(event)) {
        event.preventDefault();
      }
    };

    const preventAssetContextMenu = (event: MouseEvent) => {
      if (isProtectedAssetEvent(event)) {
        event.preventDefault();
      }
    };

    document.addEventListener("dragstart", preventAssetDrag, true);
    document.addEventListener("contextmenu", preventAssetContextMenu, true);

    return () => {
      mutationObserver.disconnect();
      document.removeEventListener("dragstart", preventAssetDrag, true);
      document.removeEventListener("contextmenu", preventAssetContextMenu, true);
    };
  }, []);

  return null;
}
