// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import { useEffect, useState } from "react";
import { useData, useRouter } from "aleph/react";
import icons from "icons";
import { IconButton } from "base/Button.tsx";
import { CALENDAR_FREE_BUSY_API, TOKEN_ENDPOINT } from "utils/const.ts";
import { EventType, getUserAvailability, getUserBySlug } from "utils/db.ts";
import {
  type DateRangeMap,
  DAY,
  daysOfMonth,
  formatToYearMonthDateLocal as format,
  MIN,
  Range,
  rangeFromObj,
  rangeIsLonger,
  rangeListToLocalDateRangeMap,
  startOfMonth,
} from "utils/datetime.ts";
import cx from "utils/cx.ts";

const longMonthFormatter = new Intl.DateTimeFormat("en-US", { month: "long" });

export const data = {
  async get(req: Request, ctx: Context) {
    const slug = ctx.params.user;
    const eventId = ctx.params.event_type;
    const user = await getUserBySlug(slug);
    if (!user) {
      return Response.json({ error: { message: "User not found" } });
    }
    const eventType = user?.eventTypes?.find((et) =>
      et.id === eventId || et.slug === eventId
    );
    const query = new URLSearchParams(new URL(req.url).search);
    const start = query.get("start");
    const end = query.get("end");
    let availableRanges: Range[] = [];
    if (start && end) {
      let startDate = new Date(start);
      if (+startDate < Date.now()) {
        startDate = new Date();
      }
      const endDate = new Date(end);
      availableRanges = await getUserAvailability(
        user!,
        startDate,
        endDate,
        {
          freeBusyApi: CALENDAR_FREE_BUSY_API,
          tokenEndpoint: TOKEN_ENDPOINT,
        },
      );
    }
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
  const { data: { eventType, error, name } } = useData<
    {
      name: string;
      availableRanges: { start: string; end: string }[];
      eventType: EventType;
      error?: { message: string };
    }
  >();
  const [date, setDate] = useState(new Date());
  const [rangeList, setRangeList] = useState<Range[]>([]);

  useEffect(() => {
    const start = date ?? new Date();
    const end = startOfMonth(date, 2);
    (async () => {
      const resp = await fetch(
        location.pathname +
          `?start=${encodeURIComponent(start.toISOString())}&end=${
            encodeURIComponent(end.toISOString())
          }`,
        { method: "GET", headers: { "Accept": "application/json" } },
      );
      const data = await resp.json();
      const rangeList = data.availableRanges?.map(rangeFromObj).filter(
        rangeIsLonger(eventType?.duration),
      );
      setRangeList(rangeList);
      console.log(rangeList);
    })();
  }, [date]);

  useEffect(() => {
    if (error) {
      redirect("/");
    }
  }, []);
  if (error) {
    return null;
  }
  const dateRangeMap = rangeListToLocalDateRangeMap(rangeList);
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
        <div className="grid grid-cols-2 gap-10 mt-4 py-5">
          <CalendarMonth
            dateRangeMap={dateRangeMap}
            side="left"
            startDate={startOfMonth(date)}
            onClickLeft={() => setDate(startOfMonth(date, -1))}
          />
          <CalendarMonth
            dateRangeMap={dateRangeMap}
            side="right"
            startDate={startOfMonth(date, 1)}
            onClickRight={() => setDate(startOfMonth(date, 1))}
          />
        </div>
      </div>
    </div>
  );
}

type CalendarMonthProp = {
  startDate: Date;
  side: "left" | "right";
  dateRangeMap: DateRangeMap;
  onClickLeft?: () => void;
  onClickRight?: () => void;
};
function CalendarMonth(
  { dateRangeMap, side, startDate, onClickLeft, onClickRight }:
    CalendarMonthProp,
) {
  const canGoBack = side === "left" &&
    startOfMonth(new Date()).valueOf() !== startDate.valueOf();
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
        {canGoBack && (
          <IconButton onClick={onClickLeft}>
            <icons.CaretLeft size={24} />
          </IconButton>
        )}
        {longMonthFormatter.format(startDate).toUpperCase()}
        {side === "right" && (
          <IconButton onClick={onClickRight}>
            <icons.CaretRight size={24} />
          </IconButton>
        )}
      </p>
      <div className="mt-10 grid grid-cols-7 gap-3.5">
        {[...Array(startDate.getDay())].map((_, i) => (
          <div key={"empty-" + i}></div>
        ))}
        {[...Array(daysOfMonth(startDate))].map((_, i) => {
          const date = new Date(+startDate + (i) * DAY);
          const available = dateRangeMap[format(date)] !== undefined;
          return (
            <div
              key={i}
              className={cx("flex justify-center text-lg rounded-full p-1.5", {
                "text-neutral-400": !available,
                "hover:bg-primary/30": available,
                "cursor-pointer": available,
                "cursor-not-allowed": !available,
              })}
            >
              {i + 1}
            </div>
          );
        })}
      </div>
    </div>
  );
}
