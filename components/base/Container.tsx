// Copyright 2022 the Deno authors. All rights reserved. MIT license.

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
