// Copyright 2022 the Deno authors. All rights reserved. MIT license.
/** @jsxImportSource https://esm.sh/react@18.2.0 */

export default function CaretRight(
  { className, size = 17 }: { className?: string; size?: number },
) {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.15616 12.3987C5.91258 12.2977 5.70442 12.1267 5.55798 11.9074C5.41155 11.6881 5.33343 11.4304 5.3335 11.1667L5.3335 5.83333C5.33355 5.56967 5.41178 5.31194 5.55829 5.09272C5.70481 4.87351 5.91302 4.70266 6.15662 4.60176C6.40022 4.50087 6.66827 4.47447 6.92687 4.52589C7.18548 4.57731 7.42303 4.70425 7.6095 4.89067L10.2762 7.55733C10.5261 7.80737 10.6665 8.14645 10.6665 8.5C10.6665 8.85355 10.5261 9.19263 10.2762 9.44266L7.6095 12.1093C7.42304 12.2959 7.18543 12.423 6.92673 12.4745C6.66803 12.526 6.39986 12.4996 6.15616 12.3987V12.3987Z"
        fill="currentColor"
      />
    </svg>
  );
}
