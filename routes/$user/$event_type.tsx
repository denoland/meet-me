// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import { useEffect, useState } from "react";
import { useData, useRouter } from "aleph/react";
import icons from "icons";
import Button, { IconButton } from "base/Button.tsx";
import SlidingPanel from "base/SlidingPanel.tsx";
import Input from "base/Input.tsx";
import Dialog from "base/Dialog.tsx";
import { CALENDAR_FREE_BUSY_API, TOKEN_ENDPOINT } from "utils/const.ts";
import { EventType, getUserAvailability, getUserBySlug } from "utils/db.ts";
import {
  createRangesInRange,
  type DateRangeMap,
  DAY,
  daysOfMonth,
  filterAvailableRange,
  formatToYearMonthDateLocal as format,
  inRange,
  MIN,
  Range,
  rangeFromObj,
  rangeIsLonger,
  rangeListToLocalDateRangeMap,
  startOfMonth,
  yearMonthDateToLocalDate,
} from "utils/datetime.ts";
import cx from "utils/cx.ts";
import { delay } from "std/async/delay.ts";
import { mapEntries } from "std/collections/map_entries.ts";

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

export default function BookPage() {
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
  const start = startOfMonth(date);
  const end = startOfMonth(date, 2);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateRangeMap, setDateRangeMap] = useState<DateRangeMap>({});
  const [showHours, setShowHours] = useState(false);
  const [showCalendar, setShowCalendar] = useState(true);
  const [mode, setMode] = useState<"calendar" | "hours">("calendar");

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
      setDateRangeMap((dateRangeMap) => {
        const map = rangeListToLocalDateRangeMap(rangeList);
        const filteredMap = mapEntries(
          map,
          ([date, availableRanges]: [string, Range[]]) => {
            const start = yearMonthDateToLocalDate(date);
            const end = new Date(+start + DAY);
            const candidateRanges = createRangesInRange(
              start,
              end,
              eventType.duration,
              30 * MIN,
            );
            const availableSlots = filterAvailableRange(
              candidateRanges,
              availableRanges,
            );
            return [date, availableSlots];
          },
        );
        return Object.assign(
          {},
          dateRangeMap,
          filteredMap,
        );
      });
    })();
  }, [date]);

  const showAvailableHourList = async () => {
    if (
      selectedDate &&
      !inRange(
        selectedDate,
        startOfMonth(date),
        startOfMonth(date, 1),
      )
    ) {
      setDate(selectedDate);
    }
    setShowCalendar(false);
    await delay(500);
    setMode("hours");
    await delay(50);
    setShowHours(true);
  };

  const hideAvailableHourList = async () => {
    setShowHours(false);
    await delay(500);
    setMode("calendar");
    await delay(50);
    setShowCalendar(true);
  };

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
          Select a date and time
        </span>
        <div className="grid grid-cols-2 gap-10 mt-4 py-5">
          <div>
            <CalendarMonth
              canMoveMonth={showCalendar}
              dateRangeMap={dateRangeMap}
              selectedDate={selectedDate}
              side="left"
              startDate={startOfMonth(date)}
              onClickLeft={() => {
                const start = startOfMonth(date, -1);
                setDate(start);
              }}
              onSelectDate={setSelectedDate}
            />
            {showHours && (
              <div className="flex justify-end mt-10">
                <Button
                  style="secondary"
                  onClick={() => {
                    setSelectedDate(null);
                    hideAvailableHourList();
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
          {mode === "calendar" && (
            <SlidingPanel
              state={showCalendar ? "center" : "right"}
            >
              <CalendarMonth
                canMoveMonth={showCalendar}
                dateRangeMap={dateRangeMap}
                selectedDate={selectedDate}
                side="right"
                startDate={startOfMonth(date, 1)}
                onClickRight={() => {
                  const start = startOfMonth(date, 1);
                  setDate(start);
                }}
                onSelectDate={setSelectedDate}
              />
            </SlidingPanel>
          )}
          {mode === "hours" &&
            (
              <SlidingPanel
                state={showHours ? "center" : "left"}
              >
                <AvailableHourList
                  userName={name}
                  eventType={eventType}
                  ranges={selectedDate
                    ? dateRangeMap[format(selectedDate)]
                    : []}
                />
              </SlidingPanel>
            )}
        </div>
        <div>
          {selectedDate && inRange(selectedDate, start, end) && showCalendar &&
            (
              <Button
                style="primary"
                onClick={showAvailableHourList}
              >
                Check
                <icons.CaretRight />
              </Button>
            )}
        </div>
      </div>
    </div>
  );
}

const isClientSide = typeof Deno === "undefined";

type CalendarMonthProp = {
  startDate: Date;
  selectedDate: Date | null;
  side: "left" | "right";
  dateRangeMap: DateRangeMap;
  onClickLeft?: () => void;
  onClickRight?: () => void;
  onSelectDate: (d: Date) => void;
  canMoveMonth: boolean;
};
function CalendarMonth(
  {
    canMoveMonth,
    dateRangeMap,
    selectedDate,
    side,
    startDate,
    onClickLeft,
    onClickRight,
    onSelectDate,
  }: CalendarMonthProp,
) {
  const canGoBack = canMoveMonth && side === "left" &&
    startOfMonth(new Date()).valueOf() !== startDate.valueOf();
  const canGoFowrad = canMoveMonth && side === "right";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
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
        {canGoFowrad && (
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
          const isToday = +date === +today && isClientSide;
          const selected = selectedDate !== null &&
            +date === +selectedDate;
          const available = !selected &&
            dateRangeMap[format(date)] !== undefined;
          const unavailable = !available && !selected;
          return (
            <div
              role={available ? "button" : ""}
              key={i}
              onClick={() => {
                if (available) {
                  onSelectDate(date);
                }
              }}
              className={cx(
                "flex justify-center text-lg rounded-full p-1.5 font-medium",
                {
                  "text-neutral-400 cursor-not-allowed": unavailable,
                  "hover:bg-primary/30 cursor-pointer": available,
                  "bg-primary text-black cursor-default": selected,
                  "border border-neutral-400": isToday,
                },
              )}
            >
              {i + 1}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const hourMinuteFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
});
const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour12: false,
  hour: "2-digit",
  minute: "2-digit",
});

type AvailableHourListProps = {
  userName: string;
  ranges: Range[];
  eventType: EventType;
};

function AvailableHourList(
  { userName, eventType, ranges }: AvailableHourListProps,
) {
  return (
    <div className="flex flex-col pt-6 px-6 gap-6 sm:max-h-110 overflow-scroll bg-dark-300 rounded-lg">
      {ranges.map((
        range,
      ) => (
        <Dialog
          title="Enter event details"
          okText="Create"
          onOk={() => {
            alert("TODO");
          }}
          message={
            <div className="mt-6 grid grid-cols-[300px_minmax(400px,_1fr)]">
              <div className="">
                <p>{userName}</p>
                <p className="text-5xl font-extrabold">{eventType.title}</p>
                <p className="text-2xl font-semibold">
                  {eventType.duration / MIN} min
                </p>
                <p>{dateFormatter.format(range.start)}</p>
                <p className="text-4xl font-thin">
                  {timeFormatter.format(range.start)} -{" "}
                  {timeFormatter.format(range.end)}
                </p>
              </div>
              <div className="border-l border-neutral-600 pl-4 grid grid-cols-[100px_minmax(300px,_1fr)] gap-4">
                <span>Name</span>
                <Input />
                <span>Email</span>
                <Input />
                <span>Guest Emails</span>
                <textarea
                  className="rounded-md p-2 min-h-20 text-black"
                  placeholder="email(s)"
                >
                </textarea>
                <span>Description</span>
                <textarea
                  className="rounded-md p-2 min-h-20 text-black"
                  placeholder="description"
                >
                </textarea>
              </div>
            </div>
          }
        >
          <div
            role="button"
            className="w-full border border-neutral-500 rounded-lg py-5 flex justify-center hover:bg-dark-400"
          >
            {hourMinuteFormatter.format(range.start)}
          </div>
        </Dialog>
      ))}
    </div>
  );
}
