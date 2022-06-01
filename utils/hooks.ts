// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import type { ReactElement, ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";

/** usePortal hook
 *
 *  please ensure to inject the `React.createPortal` to the global window object
 *  ```js
 *  import { createPortal } from "react-dom";
 *  Object.assign(window, { React: { createPortal } });
 *  ```
 */
export function usePortal(
  props?: { className?: string; lockScroll?: boolean; isDialog?: boolean },
): (el: ReactNode) => ReactElement | null {
  const { className, lockScroll, isDialog } = props || {};
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const portalRoot = document.createElement(isDialog ? "dialog" : "div");
    if (className) {
      portalRoot.className = className;
    }
    if (lockScroll) {
      document.body.style.overflow = "hidden";
    }
    document.body.appendChild(portalRoot);
    setPortalRoot(portalRoot);

    if (isDialog) {
      Object.assign(portalRoot.style, {
        width: "100vw",
        height: "100vh",
        backgroundColor: "transparent",
      });
      /* @ts-ignore */
      portalRoot.showModal?.();
    }

    return () => {
      setPortalRoot(null);
      document.body.removeChild(portalRoot);
      if (lockScroll) {
        document.body.style.overflow = "";
      }
    };
  }, []);

  return useCallback(
    (el: ReactNode) => {
      if (!window.React || !portalRoot) return null;
      /* @ts-ignore */
      return window.React?.createPortal(el, portalRoot);
    },
    [portalRoot],
  );
}
