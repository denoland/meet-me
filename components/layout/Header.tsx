// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import { useRouter } from "aleph/react";
import Dropdown from "base/Dropdown.tsx";
import icons from "icons";
import { User } from "utils/db.ts";

export function Header(
  { signin, user }: { signin: () => void; user: User | undefined },
) {
  const { url } = useRouter();
  let title = "";
  if (url.pathname === "/mypage") {
    title = "My Meetings";
  }

  return (
    <header className="h-25 max-w-screen-xl mx-auto flex items-center justify-between px-4">
      <div className="flex items-center font-bold text-2xl gap-7">
        <icons.Logo /> {title}
      </div>
      <div>
        {user
          ? <UserAccountButton user={user} />
          : <GoogleSignInButton signin={signin} />}
      </div>
    </header>
  );
}

function UserAccountButton({ user }: { user: User }) {
  const displayName = user.givenName || user.name;
  return (
    <Dropdown
      trigger="click"
      render={() => (
        <div className="rounded bg-neutral-100 text-3xl font-bold p-6">
          TODO
        </div>
      )}
    >
      <button
        className="flex items-center gap-2 bg-zinc-200 px-4 py-2 rounded-full text-black"
        onClick={() => alert("TODO: open dropdown")}
      >
        {user.picture &&
          <img className="h-5 w-5 rounded-full" src={user.picture} />}
        <span className="font-medium">{displayName}</span>
        <icons.CaretDown className="h-4 h-4 text-black" />
      </button>
    </Dropdown>
  );
}

function GoogleSignInButton({ signin }: { signin: () => void }) {
  return (
    <button
      className="flex items-center gap-2 bg-zinc-200 px-4 py-2 rounded-full text-black"
      onClick={signin}
    >
      <icons.Google />
      <span className="font-medium">Sign In</span>
    </button>
  );
}
