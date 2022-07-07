// Copyright 2022 the Deno authors. All rights reserved. MIT license.
/** @jsxImportSource https://esm.sh/react@18.2.0 */

import type {
  InputHTMLAttributes,
  PropsWithChildren,
  ReactNode,
  Ref,
} from "react";
import { forwardRef } from "react";

export type InputProps = PropsWithChildren<
  & {
    prefix?: ReactNode;
    suffix?: ReactNode;
    rounded?: boolean;
  }
  & Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "type">
  & (
    {
      type?: "text" | "password" | "email" | "tel" | "url" | "search";
      onChange?: (value: string) => void;
    } | {
      type: "number";
      onChange?: (value: number) => void;
    }
  )
>;

export default forwardRef((props: InputProps, ref: Ref<HTMLInputElement>) => {
  const {
    prefix,
    suffix,
    rounded,
    className,
    style,
    children,
    type,
    onChange,
    autoComplete = "off",
    ...rest
  } = props;
  return (
    <label
      className={[
        "inline-flex items-center justify-between gap-1 px-3 transition-colors duration-150 ease-in-out group",
        "bg-neutral-100 text-default border border-transparent focus-within:bg-white focus-within:border focus-within:border-gray-400",
        rounded ? "rounded-full" : "rounded-md",
        !(className?.includes(" h-") || className?.startsWith("h-")) && "h-9",
        className,
      ].filter(Boolean).join(" ")}
      style={style}
    >
      {prefix}
      <input
        {...rest}
        ref={ref}
        autoComplete={autoComplete}
        className="flex-1 bg-transparent placeholder:text-gray-400 border-none outline-none min-w-10"
        type={String(type)}
        onChange={(e) => {
          if (type === "number") {
            onChange?.(parseFloat(e.target.value) as never);
          } else {
            onChange?.(e.target.value as never);
          }
        }}
      />
      {suffix}
    </label>
  );
});
