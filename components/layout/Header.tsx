// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import { Link, useRouter } from "aleph/react";
import Dropdown from "base/Dropdown.tsx";
import Button from "base/Button.tsx";
import { ShadowBox } from "base/Container.tsx";
import icons from "icons";
import { User } from "utils/db.ts";

export function Header(
  { signin, user }: { signin: () => void; user: User | undefined },
) {
  const { url } = useRouter();
  const { pathname } = url;
  let title = "Meet Me";
  if (pathname === "/mypage") {
    title = "My Meetings";
  }

  const isInMyPage = pathname === "/mypage" || pathname === "/mypage/settings";
  const isInLandingPage = pathname === "/";

  return (
    <header className="h-25 max-w-screen-xl mx-auto flex items-center justify-between px-4">
      <div className="flex items-center font-bold text-2xl gap-7">
        <Link to="/">
          <icons.Logo />
        </Link>{" "}
        {title}
      </div>
      <div>
        {user && isInMyPage && <UserAccountButton user={user} />}
        {isInLandingPage && <GoogleSignInButton signin={signin} />}
      </div>
    </header>
  );
}

function UserAccountButton({ user }: { user: User }) {
  const { redirect } = useRouter();
  const displayName = user.givenName || user.name;
  return (
    <Dropdown
      trigger="click"
      position="right"
      render={() => (
        <ShadowBox className="text-white flex flex-col">
          <div className="flex flex-col items-center gap-2 p-6 text-sm">
            <img className="rounded-full mb-2" src={user.picture} />
            <span>{user.name}</span>
            <a className="text-blue-400" href={`/${user.slug}`} target="_blank">
              meet-me.deno.dev/{user.slug}
            </a>
          </div>
          <div className="border-t border-neutral-700 px-6 py-2">
            <Button
              onClick={() => {
                redirect("/signout");
              }}
            >
              Sign out
            </Button>
          </div>
        </ShadowBox>
      )}
    >
      <button className="flex items-center gap-2 bg-zinc-200 px-4 py-2 rounded-full text-black">
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
