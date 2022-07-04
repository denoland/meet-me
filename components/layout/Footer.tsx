// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import icons from "icons";

export function Footer() {
  return (
    <footer className="sticky top-full max-w-screen-xl mx-auto mt-8 h-25 flex lt-sm:flex-col flex-row lt-sm:items-start items-center lt-sm:gap-5 gap-9 px-4 text-gray-300">
      <span className="flex items-center gap-4">
        <icons.Deno className="h-5 w-5" /> Powered by Deno
      </span>
      <div className="flex items-center lt-sm:gap-4 gap-9">
        <a href="https://github.com/denoland/meet-me">
          Source
        </a>
        <a href="https://www.figma.com/file/P0XsTDIeiwNhm8jFS03gwz/Deno-Showcases-Mockup?node-id=0%3A1">
          Figma
        </a>
        <a href="https://github.com/denoland/meet-me/issues">
          Issues
        </a>
        <a href="/terms">
          Terms
        </a>
        <a href="/privacy">
          Privacy
        </a>
      </div>
    </footer>
  );
}
