// Copyright 2022 the Deno authors. All rights reserved. MIT license.
import icons from "icons";
export function Footer() {
  return (
    <footer className="sticky top-full max-w-screen-xl mx-auto mt-8 h-25 flex items-center gap-4 px-4">
      <icons.Deno className="h-5 w-5" />
      <span className="text-gray-300">Powered by Deno</span>
    </footer>
  );
}
