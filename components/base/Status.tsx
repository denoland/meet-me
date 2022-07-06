// Copyright 2022 the Deno authors. All rights reserved. MIT license.
/** @jsxImportSource https://esm.sh/react@18.1.0 */

import cx from "utils/cx.ts";
import icons from "../icons/mod.ts";

type StatusProps = {
  iconSize?: number;
  className?: string;
};

const sharedClassName =
  "w-5 h-5 inline-flex items-center justify-center rounded-full flex-shrink-0";

export function Ok({ className, iconSize = 10 }: StatusProps) {
  return (
    <span className={cx(sharedClassName, "bg-primary/15", className)}>
      <icons.Check className="text-primary" size={iconSize} />
    </span>
  );
}

export function Info({ className, iconSize = 10 }: StatusProps) {
  return (
    <span className={cx(sharedClassName, "bg-blue/15", className)}>
      <icons.Exclamation className="text-blue rotate-180" size={iconSize} />
    </span>
  );
}

export function Warn({ className, iconSize = 10 }: StatusProps) {
  return (
    <span className={cx(sharedClassName, "bg-orange-500/15", className)}>
      <icons.Exclamation className="text-orange-500" size={iconSize} />
    </span>
  );
}

export function Danger({ className, iconSize = 10 }: StatusProps) {
  return (
    <span className={cx(sharedClassName, "bg-danger/15", className)}>
      <icons.Exclamation className="text-danger" size={iconSize} />
    </span>
  );
}
