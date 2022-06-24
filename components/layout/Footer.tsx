// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import icons from "icons";

export function Footer() {
  return (
    <footer className="sticky top-full max-w-screen-xl mx-auto mt-8 h-25 flex items-center gap-4 px-4 text-gray-300">
      <icons.Deno className="h-5 w-5" />
      <a href="https://github.com/denoland/showcase_cal">
        <span>Powered by Deno</span>
      </a>
      ・
      <a href="https://www.figma.com/file/P0XsTDIeiwNhm8jFS03gwz/Deno-Cal">
        Figma
      </a>
      ・
      <a href="https://github.com/denoland/showcase_cal/issues">
        Issues
      </a>
      ・
      <a href="/terms">
        Terms
      </a>
      ・
      <a href="/privacy">
        Privacy
      </a>
    </footer>
  );
}
