// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import { useForwardProps } from "aleph/react";
import { UserForClient as User } from "utils/db.ts";

export default function MyPage() {
  const { user } = useForwardProps<
    { user: User }
  >();
  return (
    <div className="max-w-screen-xl px-4 m-auto">
      <div className="mt-4 flex items-center gap-3">
        <img src={user.picture} className="rounded-full h-10 w-10" />
        <div className="flex flex-col gap-1 text-sm">
          <p>{user.name}</p>
          <p>
            <a className="text-blue-400" href={`/${user.slug}`} target="_blank">
              meet-me.deno.dev/{user.slug}
            </a>
          </p>
        </div>
      </div>
      <div className="mt-12 ml-7 text-6xl font-bold">TODO</div>
    </div>
  );
}
