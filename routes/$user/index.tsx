// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import { useEffect } from "react";
import { useData, useRouter } from "aleph/react";
import { type EventType, getUserBySlug } from "utils/db.ts";
import { MIN } from "utils/datetime.ts";
import Badge from "base/Badge.tsx";

export const data = {
  async get(_req: Request, ctx: Context) {
    const slug = ctx.params.user;
    const user = await getUserBySlug(slug);
    if (!user) {
      return Response.json({ error: { message: "User not found" } });
    }
    // Passes only necessary info
    return Response.json({
      picture: user?.picture,
      name: user?.name,
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
      picture?: string;
      name?: string;
      givenName?: string;
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
    <div className="max-w-screen-md px-4 m-auto">
      <p className="flex flex-col items-center gap-2 text-lg">
        {data.picture && (
          <img className="h-10 w-10 rounded-full" src={data.picture} />
        )}
        {data.name}
      </p>
      <p className="mt-2 text-center text-neutral-400 text-sm max-w-100 mx-auto">
        Welcome to my booking page. Please follow the instructions to add an
        event to my calendar.
      </p>
      <div className="mt-10 grid lt-sm:grid-cols-1 grid-cols-3 gap-3">
        {data.eventTypes!.map((et) => (
          <a
            className="inline-block rounded-lg border px-6 py-7 hover:bg-dark-300 border-neutral-700"
            href={`/${data.slug}/${et.slug || et.id}`}
          >
            <Badge>{et.duration / MIN} min</Badge>
            <p className="font-bold">{et.title}</p>
            <p className="text-neutral-600 text-sm">{et.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
