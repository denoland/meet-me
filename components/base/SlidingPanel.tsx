// Copyright 2022 the Deno authors. All rights reserved. MIT license.
/** @jsxImportSource https://esm.sh/react@18.1.0 */

import { PropsWithChildren } from "react";
import cx from "utils/cx.ts";

export type PanelState = "left" | "center" | "right";

export default function SlidingPanel(
  { state, children, className }: PropsWithChildren<
    { state: PanelState; className?: string }
  >,
) {
  return (
    <div
      className={cx("!transition-500", className, {
        "opacity-0": state !== "center",
        "!-translate-x-5": state === "right",
        "!translate-x-5": state === "left",
      })}
    >
      {children}
    </div>
  );
}
