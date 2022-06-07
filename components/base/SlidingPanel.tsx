// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import { PropsWithChildren } from "react";
import cx from "utils/cx.ts";

export type PanelState = "left" | "center" | "right";

export default function SlidingPanel(
  { state, children }: PropsWithChildren<{ state: PanelState }>,
) {
  return (
    <div
      className={cx("w-screen !transition-500", {
        "opacity-0": state !== "center",
        "!-translate-x-5": state === "right",
        "!translate-x-5": state === "left",
      })}
    >
      {children}
    </div>
  );
}
