// Copyright 2022 the Deno authors. All rights reserved. MIT license.

type IconProps = {
  size?: number;
  className?: string;
};

export default function Icon({ size = 16, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.33337 2.66671C1.33337 1.93033 1.93033 1.33337 2.66671 1.33337H9.33337C10.0698 1.33337 10.6667 1.93033 10.6667 2.66671V5.33337H13.3334C14.0698 5.33337 14.6667 5.93033 14.6667 6.66671V13.3334C14.6667 14.0698 14.0698 14.6667 13.3334 14.6667H6.66671C5.93033 14.6667 5.33337 14.0698 5.33337 13.3334V10.6667H2.66671C1.93033 10.6667 1.33337 10.0698 1.33337 9.33337V2.66671ZM6.66671 10.6667V13.3334H13.3334V6.66671H10.6667V9.33337C10.6667 10.0698 10.0698 10.6667 9.33337 10.6667H6.66671ZM9.33337 9.33337V2.66671L2.66671 2.66671V9.33337H9.33337Z"
        fill="currentColor"
      />
    </svg>
  );
}
