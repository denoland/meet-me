// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import { useEffect } from "react";
import { useData, useRouter } from "aleph/react";
import { CALENDAR_FREE_BUSY_API, TOKEN_ENDPOINT } from "utils/const.ts";
import { EventType, getUserAvailability, getUserBySlug } from "utils/db.ts";

export const data = {
  async get(_req: Request, ctx: Context) {
    const slug = ctx.params.user;
    const eventId = ctx.params.event_type;
    const user = await getUserBySlug(slug);
    if (!user) {
      return Response.json({ error: { message: "User not found" } });
    }
    const eventType = user?.eventTypes?.find((et) =>
      et.id === eventId || et.slug === eventId
    );
    const availableRanges = await getUserAvailability(
      user!,
      new Date(),
      new Date("2022-07-31"),
      {
        freeBusyApi: CALENDAR_FREE_BUSY_API,
        tokenEndpoint: TOKEN_ENDPOINT,
      },
    );
    // Passes only necessary info
    return Response.json({
      givenName: user?.givenName,
      availableRanges,
      eventType,
    });
  },
};

export default function () {
  const { redirect } = useRouter();
  const { data } = useData<
    {
      givenName: string;
      availableRanges: { start: string; end: string }[];
      eventType: EventType;
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
      <pre>{JSON.stringify(data.availableRanges, null, 2)}</pre>
      <pre>{JSON.stringify(data.eventType, null, 2)}</pre>
    </div>
  );
}
