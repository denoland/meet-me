// Copyright Deno Land Inc. All Rights Reserved. Proprietary and confidential.
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
        d="M12.6663 7.33334V13.6C12.6663 13.7061 12.6242 13.8078 12.5492 13.8829C12.4742 13.9579 12.3724 14 12.2663 14H3.73301C3.62692 14 3.52518 13.9579 3.45017 13.8829C3.37515 13.8078 3.33301 13.7061 3.33301 13.6V7.33334"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.66699 11.3333V7.33334"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.33301 11.3333V7.33334"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.33333 4.66667H10.6667M14 4.66667H10.6667H14ZM2 4.66667H5.33333H2ZM5.33333 4.66667V2.4C5.33333 2.29391 5.37548 2.19217 5.45049 2.11716C5.5255 2.04214 5.62725 2 5.73333 2H10.2667C10.3728 2 10.4745 2.04214 10.5495 2.11716C10.6245 2.19217 10.6667 2.29391 10.6667 2.4V4.66667H5.33333Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
