// Copyright 2022 the Deno authors. All rights reserved. MIT license.
import icons from "icons";
import { User } from "utils/db.ts";

export function Header(
  { signin, user }: { signin: () => void; user: User | undefined },
) {
  return (
    <header className="h-25 max-w-screen-xl mx-auto flex items-center justify-between px-4">
      <div>
        <icons.Logo />
      </div>
      <div className="">
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
    <button
      className="flex items-center gap-2 bg-zinc-200 px-4 py-2 rounded-full text-black"
      onClick={() => alert("TODO: open dropdown")}
    >
      {user.picture &&
        <img className="h-5 w-5 rounded-full" src={user.picture} />}
      <span className="font-medium">{displayName}</span>
      <icons.CarretDown className="h-4 h-4 text-black" />
    </button>
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
