// Copyright 2022 the Deno authors. All rights reserved. MIT license.
import type { ReactNode } from "react";
import { forwardProps, useData } from "aleph/react";
import { getUserByToken, UserForClient } from "utils/db.ts";

export const data = {
  async get(_: Request, ctx: Context) {
    const token = ctx.cookies.get("token");
    if (!token) {
      return ctx.json({ user: null });
    }
    console.log("mypage token", token);
    const user = await getUserByToken(token);
    console.log("mypage user", user);

    return ctx.json({ user });
  },
};

export default function MyPageRoot({ children }: { children?: ReactNode }) {
  const { data: { user } } = useData<
    { user: UserForClient }
  >();
  console.log("MyPageRoot");
  console.log("user", user);
  return (
    <>
      {forwardProps(children, { user })}
    </>
  );
}
