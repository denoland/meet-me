// Copyright 2022 the Deno authors. All rights reserved. MIT license.
import icons from "icons";

export function Header(props: { signin: () => void }) {
  return (
    <header className="h-25 max-w-screen-xl mx-auto flex items-center justify-between px-4">
      <div>
        <icons.Logo />
      </div>
      <div className="">
        <button
          className="flex items-center gap-2 bg-zinc-200 px-4 py-2 rounded-full text-black"
          onClick={props.signin}
        >
          <icons.Google />
          <span className="font-medium">Sign In</span>
        </button>
      </div>
    </header>
  );
}
