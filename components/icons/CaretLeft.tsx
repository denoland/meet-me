// Copyright 2022 the Deno authors. All rights reserved. MIT license.
/** @jsxImportSource https://esm.sh/react@18.1.0 */

export default function CaretLeft(
  { className, size = 17 }: { className?: string; size?: number },
) {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.766 18.348C15.1314 18.1965 15.4436 17.9401 15.6633 17.6111C15.8829 17.2822 16.0001 16.8955 16 16.5L16 8.5C15.9999 8.1045 15.8826 7.7179 15.6628 7.38908C15.443 7.06026 15.1307 6.80398 14.7653 6.65264C14.3999 6.5013 13.9978 6.4617 13.6099 6.53883C13.222 6.61597 12.8657 6.80638 12.586 7.086L8.586 11.086C8.21106 11.4611 8.00043 11.9697 8.00043 12.5C8.00043 13.0303 8.21106 13.5389 8.586 13.914L12.586 17.914C12.8657 18.1939 13.2221 18.3845 13.6102 18.4617C13.9982 18.539 14.4005 18.4994 14.766 18.348Z"
        fill="currentColor"
      />
    </svg>
  );
}
