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
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M29.5 6H24V2.5H22V6H10V2.5H8V6H2.5C2.10232 6.00046 1.72106 6.15865 1.43985 6.43985C1.15865 6.72106 1.00046 7.10232 1 7.5V28.5C1.00046 28.8977 1.15865 29.2789 1.43985 29.5601C1.72106 29.8414 2.10232 29.9995 2.5 30H29.5C29.8977 29.9995 30.2789 29.8414 30.5601 29.5601C30.8414 29.2789 30.9995 28.8977 31 28.5V7.5C30.9995 7.10232 30.8414 6.72106 30.5601 6.43985C30.2789 6.15865 29.8977 6.00046 29.5 6ZM29 28H3V8H8V10.5H10V8H22V10.5H24V8H29V28Z"
        fill="currentColor"
      />
      <path
        d="M7 14H9V16H7V14ZM12.5 14H14.5V16H12.5V14ZM17.5 14H19.5V16H17.5V14ZM23 14H25V16H23V14ZM7 18.5H9V20.5H7V18.5ZM12.5 18.5H14.5V20.5H12.5V18.5ZM17.5 18.5H19.5V20.5H17.5V18.5ZM23 18.5H25V20.5H23V18.5ZM7 23H9V25H7V23ZM12.5 23H14.5V25H12.5V23ZM17.5 23H19.5V25H17.5V23ZM23 23H25V25H23V23Z"
        fill="currentColor"
      />
    </svg>
  );
}
