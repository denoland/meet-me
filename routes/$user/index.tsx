// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import { useData, useForwardProps } from "aleph/react";
import { getUserBySlug, UserForClient as User } from "utils/db.ts";
import { ok } from "utils/api.ts";

export const data = {
  async get(_req: Request, ctx: Context) {
    const slug = ctx.params.user;
    const user = await getUserBySlug(slug);
    // Passes only necessary info
    return ok({ givenName: user?.givenName });
  },
};

export default function () {
  const { data } = useData<User>();
  return (
    <div className="max-w-screen-xl px-4 m-auto">
      <h1>{data.givenName}'s booking page</h1>
    </div>
  );
}
