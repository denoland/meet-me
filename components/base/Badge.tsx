// Copyright 2022 the Deno authors. All rights reserved. MIT license.
/** @jsxImportSource https://esm.sh/react@18.1.0 */

import { ReactNode } from "react";

export default function Badge(
  { children }: { children: ReactNode | undefined },
) {
  return (
    <span className="text-xs font-semibold bg-neutral-600 rounded-full px-3 py-0.5 text-xs">
      {children}
    </span>
  );
}
