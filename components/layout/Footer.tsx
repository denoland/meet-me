// Copyright 2022 the Deno authors. All rights reserved. MIT license.
/** @jsxImportSource https://esm.sh/react@18.2.0 */

import icons from "icons";

const links = [
  [
    "https://github.com/denoland/meet-me",
    "Source",
  ],
  [
    "https://www.figma.com/file/P0XsTDIeiwNhm8jFS03gwz/Deno-Showcases-Mockup?node-id=0%3A1",
    "Figma",
  ],
  [
    "https://github.com/denoland/meet-me/issues",
    "Issues",
  ],
  ["/terms", "Terms"],
  ["/privacy", "Privacy"],
];

export function Footer() {
  return (
    <footer className="sticky top-full max-w-screen-xl mx-auto mt-8 h-25 flex lt-sm:flex-col flex-row lt-sm:items-start items-center lt-sm:gap-5 gap-6 px-4">
      <span className="flex items-center gap-2 text-gray-300">
        <icons.Deno className="h-5 w-5" /> Powered by Deno
      </span>
      <div className="flex items-center lt-sm:gap-4 gap-6">
        {links.map(([href, text]) => (
          <a
            href={href}
            key={href}
            className="text-gray-500 border-b-1 border-transparent hover:text-gray-300 hover:border-gray-200"
          >
            {text}
          </a>
        ))}
      </div>
    </footer>
  );
}
