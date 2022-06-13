// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  PropsWithChildren,
  useMemo,
} from "react";
import cx from "utils/cx.ts";

type ButtonProps = PropsWithChildren<
  {
    href?: string;
    style?:
      | "primary"
      | "secondary"
      | "danger"
      | "alternate"
      | "outline"
      | "none";
    disabled?: boolean;
    size?: "xs" | "md";
  } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style" | "disabled">
>;

export default function Button(
  { children, style, disabled, size = "md", ...rest }: ButtonProps,
) {
  const btnClassName = useMemo(() => {
    const base = "inline-flex items-center gap-2 transition";
    return [
      base,
      size === "md" && "px-5 py-2",
      size === "xs" && "px-1 py-1",
      style === "primary" && "rounded-full bg-primary text-black",
      style === "outline" && "rounded-md text-white border border-gray-600",
      disabled && "opacity-60 cursor-not-allowed",
      !disabled && "hover:opacity-80",
    ].filter(Boolean).join(" ");
  }, [disabled, style]);

  return (
    <button className={btnClassName} disabled={disabled} {...rest}>
      {children}
    </button>
  );
}

const ICON_BUTTON_BASE =
  "flex items-center justify-center hover:bg-gray-200/60 rounded-full w-6 h-6";

export function IconButton(
  { children, className, disabled, size: _, style: __, href, ...rest }:
    ButtonProps,
) {
  return (
    <button
      className={cx(ICON_BUTTON_BASE, className)}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}

type IconLinkProps = PropsWithChildren<AnchorHTMLAttributes<HTMLAnchorElement>>;

export function IconLink({ children, className, ...rest }: IconLinkProps) {
  return (
    <a className={cx(ICON_BUTTON_BASE, className)} {...rest}>
      {children}
    </a>
  );
}
