// Copyright 2022 the Deno authors. All rights reserved. MIT license.
import { ButtonHTMLAttributes, PropsWithChildren, useMemo } from "react";

type ButtonProps = PropsWithChildren<
  {
    style?: "primary" | "secondary" | "danger" | "alternate" | "outline";
    disabled?: boolean;
  } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style" | "disabled">
>;

export default function Button(
  { children, style, disabled, ...rest }: ButtonProps,
) {
  const btnClassName = useMemo(() => {
    const base = "px-5 py-2 inline-flex items-center gap-2 transition";
    return [
      base,
      style === "primary" && "rounded-full bg-primary text-black",
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
