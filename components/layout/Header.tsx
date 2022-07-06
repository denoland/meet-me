// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import type { PropsWithChildren } from "react";
import { Link, useRouter } from "aleph/react";
import { IconLink } from "base/Button.tsx";
import Dropdown from "base/Dropdown.tsx";
import Copyable from "base/Copyable.tsx";
import { ShadowBox } from "base/Container.tsx";
import icons from "icons";
import type { User } from "utils/db.ts";

export function Header(
  { signin, user }: { signin: () => void; user: User | undefined },
) {
  const { url } = useRouter();
  const { pathname } = url;
  const isMyPage = pathname === "/mypage";
  const isInMyPage = pathname === "/mypage" || pathname === "/mypage/settings";
  const isInLandingPage = pathname === "/";

  return (
    <header className="h-25 max-w-screen-xl mx-auto flex items-center justify-between px-4">
      <div className="flex items-center gap-4 font-semibold text-xl text-neutral-300">
        <Link to="/">
          <icons.Logo />
        </Link>{" "}
        {isMyPage ? "My Meetings" : "Meet Me"}
      </div>
      <div>
        {user && isInMyPage && <UserAccountButton user={user} />}
        {isInLandingPage && <GoogleSignInButton signin={signin} />}
      </div>
    </header>
  );
}

function UserAccountButton({ user }: { user: User }) {
  const displayName = user.givenName || user.name;
  return (
    <Dropdown
      trigger="click"
      position="right"
      render={() => <UserDropdown user={user} />}
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

function UserDropdown({ user }: { user: User }) {
  return (
    <ShadowBox className="min-w-50 text-white flex flex-col">
      <div className="flex flex-col items-center gap-2 p-6 text-sm">
        <img className="w-17 h-17 rounded-full mb-2" src={user.picture} />
        <span>{user.name}</span>
        <div className="flex items-center gap-1">
          <a className="text-blue-400" href={`/${user.slug}`} target="_blank">
            meet-me.deno.dev/{user.slug}
          </a>
          <IconLink href={`/${user.slug}`} target="_blank">
            <icons.ExternalLink />
          </IconLink>
          <Copyable value={`https://meet-me.deno.dev/${user.slug}`} />
        </div>
      </div>
      <ul>
        <UserDropdownMenuItem href="/mypage/settings">
          Settings
        </UserDropdownMenuItem>
        <UserDropdownMenuItem
          href={`https://calendar.google.com/calendar?authuser=${user.email}`}
        >
          Go to Google Calendar
        </UserDropdownMenuItem>
        <UserDropdownMenuItem href="https://github.com/denoland/meet-me">
          Source code
        </UserDropdownMenuItem>
        <UserDropdownMenuItem href="/signout" native>
          Sign out
        </UserDropdownMenuItem>
      </ul>
    </ShadowBox>
  );
}

function UserDropdownMenuItem({
  href,
  native,
  children,
}: PropsWithChildren<{
  href: string;
  native?: boolean;
}>) {
  const external = href.startsWith("https://");
  return (
    <li className="cursor-pointer border-t border-neutral-700 px-6 py-2">
      {external || native
        ? <a className="text-black" href={href}>{children}</a>
        : (
          <Link to={href}>
            {children}
          </Link>
        )}
      {external && <icons.ExternalLink className="h-4 w-4" />}
    </li>
  );
}

function GoogleSignInButton({ signin }: { signin: () => void }) {
  return (
    <button
      className="flex items-center gap-2 bg-zinc-200 hover:bg-zinc-300 px-6 py-2 rounded-full text-black"
      onClick={signin}
    >
      <icons.Google />
      <span className="font-medium">Sign In</span>
    </button>
  );
}
