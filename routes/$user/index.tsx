// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import { useEffect } from "react";
import { useData, useRouter } from "aleph/react";
import { EventType, getUserBySlug } from "utils/db.ts";
import { ok } from "utils/api.ts";

export const data = {
  async get(_req: Request, ctx: Context) {
    const slug = ctx.params.user;
    const user = await getUserBySlug(slug);
    if (!user) {
      return Response.json({ error: { message: "User not found" } });
    }
    // Passes only necessary info
    return ok({
      givenName: user?.givenName,
      slug: user?.slug,
      eventTypes: user?.eventTypes,
    });
  },
};

export default function () {
  const { redirect } = useRouter();
  const { data } = useData<
    {
      givenName: string;
      slug: string;
      eventTypes: EventType[];
      error?: { message: string };
    }
  >();

  useEffect(() => {
    if (data.error) {
      redirect("/");
    }
  }, []);
  if (data.error) {
    return null;
  }

  return (
    <div className="max-w-screen-xl px-4 m-auto">
      <h1>{data.givenName}'s booking page</h1>
      <ul>
        {data.eventTypes!.map((et) => (
          <li>
            <a
              className="text-blue-400"
              href={`/${data.slug}/${et.slug || et.id}`}
            >
              {et.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
