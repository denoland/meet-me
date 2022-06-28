// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import { SelectHTMLAttributes } from "react";
import cx from "utils/cx.ts";

type Props =
  & { onChange?(value: string): void }
  & Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange">;

export default function Select(props: Props) {
  const { children, onChange, className, ...rest } = props;
  return (
    <select
      className={cx(
        "rounded-md py-2 px-3 text-black bg-neutral-100",
        className,
      )}
      onChange={onChange
        ? (e) => {
          onChange(e.target.value);
        }
        : undefined}
      {...rest}
    >
      {children}
    </select>
  );
}
