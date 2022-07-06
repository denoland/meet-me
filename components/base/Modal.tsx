// Copyright 2022 the Deno authors. All rights reserved. MIT license.
/** @jsxImportSource https://esm.sh/react@18.2.0 */

import { useCallback, useEffect, useState } from "react";
import cx from "utils/cx.ts";
import { onKeyDown, usePortal } from "utils/hooks.ts";
import icons from "../icons/mod.ts";

type ModalProps = React.PropsWithChildren<{
  className?: string;
  showCloseButton?: boolean;
  onESC?: () => void;
}>;

export default function Modal(props: ModalProps) {
  const { className, showCloseButton, onESC, children } = props;
  const portal = usePortal({
    className: "modal-overlay",
    lockScroll: true,
  });
  const [tansitionTiggered, setTansitionTiggered] = useState(false);

  onKeyDown(
    (e) => e.key.toLowerCase() === "escape",
    useCallback(() => onESC?.(), [onESC]),
  );

  useEffect(() => {
    let timer: number | null = setTimeout(() => {
      timer = null;
      setTansitionTiggered(true);
    }, 1000 / 60);
    return () => {
      timer && clearTimeout(timer);
    };
  }, []);

  return portal(
    <div className="fixed top-0 left-0 z-50 w-screen h-screen flex items-center justify-center text-white">
      <div
        className={cx(
          "absolute top-0 left-0 w-full h-full bg-black/30 transition-opacity duration-100",
          {
            "opacity-0": !tansitionTiggered,
            "opacity-100": tansitionTiggered,
          },
        )}
        onClick={onESC}
      />
      <div
        className={cx(
          "relative bg-dark-400 border border-neutral-700 rounded-lg shadow-xl shadow-gray-500/10 overflow-auto",
          "transition-top,opacity duration-300",
          {
            "-top-4 opacity-0": !tansitionTiggered,
            "top-0 opacity-100": tansitionTiggered,
          },
          className,
        )}
        style={{ maxHeight: "90vh", maxWidth: "90vw" }}
      >
        {children}
        {showCloseButton && tansitionTiggered && (
          <button
            type="button"
            title="Close"
            onClick={onESC}
            className="absolute right-4 top-4 w-6 h-6 rounded-full flex items-center justify-center bg-transparent text-gray-400 hover:text-gray-800 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <icons.Close size={14} />
          </button>
        )}
      </div>
    </div>,
  );
}
