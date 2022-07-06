// Copyright 2022 the Deno authors. All rights reserved. MIT license.
/** @jsxImportSource https://esm.sh/react@18.2.0 */

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
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="4.75" cy="7.75" r="0.75" fill="currentColor" />
      <line
        x1="4.75"
        y1="1.75"
        x2="4.75"
        y2="5.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
