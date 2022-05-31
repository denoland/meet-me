// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import { ButtonHTMLAttributes, PropsWithChildren, useMemo } from "react";

type ButtonProps = PropsWithChildren<
  {
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
