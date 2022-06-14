// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import { useData, useForwardProps } from "aleph/react";
import { EventType, getUserBySlug, Range } from "utils/db.ts";
import { ok } from "utils/api.ts";

export const data = {
  async get(_req: Request, ctx: Context) {
    const slug = ctx.params.user;
    const eventId = ctx.params.event_type;
    console.log(eventId);
    const user = await getUserBySlug(slug);
    const eventType = user?.eventTypes?.find((et) =>
      et.id === eventId || et.slug === eventId
    );
    // Passes only necessary info
    return ok({
      givenName: user?.givenName,
      availabilities: user?.availabilities,
      eventType,
    });
  },
};

export default function () {
  const { data } = useData<
    { givenName: string; availabilities: Range[]; eventType: EventType }
  >();
  return (
    <div className="max-w-screen-xl px-4 m-auto">
      <h1>{data.givenName}'s booking page</h1>
      <pre>{JSON.stringify(data.availabilities, null, 2)}</pre>
      <pre>{JSON.stringify(data.eventType, null, 2)}</pre>
    </div>
  );
}
