// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import { useEffect } from "react";
import { useData, useRouter } from "aleph/react";
import icons from "icons";
import { CALENDAR_FREE_BUSY_API, TOKEN_ENDPOINT } from "utils/const.ts";
import { EventType, getUserAvailability, getUserBySlug } from "utils/db.ts";
import { MIN } from "utils/datetime.ts";
import cx from "utils/cx.ts";

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
      name: user?.name,
      availableRanges,
      eventType,
    });
  },
};

export default function () {
  const { redirect } = useRouter();
  const { data: { eventType, error, name, availableRanges } } = useData<
    {
      name: string;
      availableRanges: { start: string; end: string }[];
      eventType: EventType;
      error?: { message: string };
    }
  >();
  useEffect(() => {
    if (error) {
      redirect("/");
    }
  }, []);
  if (error) {
    return null;
  }
  return (
    <div className="max-w-screen-xl px-4 mt-10 m-auto grid grid-cols-3 gap-20">
      <div className="border-t border-neutral-600 pt-4">
        <h1>{name}</h1>
        <p>{eventType.duration / MIN}min</p>
        <p>{eventType.title}</p>
        <p>{eventType.description}</p>
      </div>
      <div className="col-span-2 border-t border-neutral-600 relative">
        <span className="absolute -top-4 pr-8 bg-dark-400 text-lg font-medium">
          Select the date
        </span>
        <div className="grid grid-cols-2 gap-10 mt-5 py-5">
          <CalendarMonth side="left" />
          <CalendarMonth side="right" />
        </div>
      </div>
    </div>
  );
}

type CalendarMonthProp = {
  side: "left" | "right";
};
function CalendarMonth({ side }: CalendarMonthProp) {
  return (
    <div>
      <p
        className={cx(
          "flex items-center gap-2 text-neutral-500 font-bold text-xl",
          {
            "justify-end": side === "right",
          },
        )}
      >
        {side === "left" && <icons.CaretRight size={24} />}
        May
        {side === "right" && <icons.CaretRight size={24} />}
      </p>
      <div className="mt-10 grid grid-cols-7 gap-6">
        {[...Array(31)].map((_, i) => (
          <div className="flex justify-center text-lg">
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
