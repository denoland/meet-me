// Copyright 2022 the Deno authors. All rights reserved. MIT license.
/** @jsxImportSource https://esm.sh/react@18.1.0 */

import type {
  HTMLAttributes,
  MutableRefObject,
  PropsWithChildren,
} from "react";
import cx from "utils/cx.ts";

type ContainerProps = PropsWithChildren<
  & {
    small?: boolean;
    innerRef?: MutableRefObject<HTMLDivElement | null>;
  }
  & HTMLAttributes<HTMLDivElement>
>;

export function ShadowBox({ className, children, ...rest }: ContainerProps) {
  return (
    <div
      className={cx(
        "bg-dark-400 border border-neutral-700 rounded-lg shadow-xl shadow-neutral-500/10",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
