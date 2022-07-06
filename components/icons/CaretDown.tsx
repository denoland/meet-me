// Copyright 2022 the Deno authors. All rights reserved. MIT license.
/** @jsxImportSource https://esm.sh/react@18.1.0 */

export default function CaretDown(
  { className, size = 17 }: { className?: string; size?: number },
) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.83849 6.65601C4.93948 6.41243 5.11043 6.20426 5.32972 6.05783C5.54901 5.9114 5.8068 5.83328 6.07049 5.83334H11.4038C11.6675 5.8334 11.9252 5.91163 12.1444 6.05814C12.3636 6.20465 12.5345 6.41287 12.6354 6.65647C12.7363 6.90007 12.7627 7.16812 12.7113 7.42672C12.6598 7.68532 12.5329 7.92287 12.3465 8.10934L9.67982 10.776C9.42978 11.026 9.09071 11.1664 8.73715 11.1664C8.3836 11.1664 8.04452 11.026 7.79449 10.776L5.12782 8.10934C4.94124 7.92288 4.81416 7.68527 4.76266 7.42657C4.71116 7.16787 4.73755 6.89971 4.83849 6.65601Z"
        fill="currentColor"
      />
    </svg>
  );
}
