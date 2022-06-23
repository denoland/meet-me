// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import { PropsWithChildren, useEffect, useState } from "react";
import { Link, useData, useRouter } from "aleph/react";
import icons from "icons";
import Button, { IconButton } from "base/Button.tsx";
import Badge from "base/Badge.tsx";
import SlidingPanel from "base/SlidingPanel.tsx";
import Input from "base/Input.tsx";
import Dialog from "base/Dialog.tsx";
import { notify } from "base/Notification.tsx";
import { CALENDAR_FREE_BUSY_API, TOKEN_ENDPOINT } from "utils/const.ts";
import {
  ensureAccessTokenIsFreshEnough,
  EventType,
  getUserAvailability,
  getUserBySlug,
} from "utils/db.ts";
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
import { CALENDAR_EVENTS_API } from "utils/const.ts";
import { delay } from "std/async/delay.ts";
import { mapEntries } from "std/collections/map_entries.ts";
import party from "https://jspm.dev/party-js";

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
      await ensureAccessTokenIsFreshEnough(user, TOKEN_ENDPOINT);
      availableRanges = await getUserAvailability(
        user!,
        startDate,
        endDate,
        CALENDAR_FREE_BUSY_API,
      );
    }
    // Passes only necessary info to client
    return Response.json({
      name: user?.name,
      availableRanges,
      eventType,
    });
  },
  async post(req: Request, ctx: Context) {
    const slug = ctx.params.user;
    const eventId = ctx.params.event_type;
    const user = await getUserBySlug(slug);
    if (!user) {
      return Response.json({ error: { message: "User not found" } });
    }
    const eventType = user?.eventTypes?.find((et) =>
      et.id === eventId || et.slug === eventId
    );
    const data = await req.json() as {
      start: string;
      end: string;
      name: string;
      email: string;
      guestEmails?: string;
      description?: string;
    };
    const body = {
      start: { dateTime: data.start },
      end: { dateTime: data.end },
      summary: data.name + " and " + user.name,
      description: `Event type: ${eventType?.title}\n\n` + data.description,
      attendees: [{ email: data.email }],
    };
    const guestEmails = data.guestEmails;
    if (guestEmails) {
      for (const email of guestEmails.trim().split(/[\s,]+/g)) {
        body.attendees.push({ email });
      }
    }
    try {
      await ensureAccessTokenIsFreshEnough(user, TOKEN_ENDPOINT);
      const start = new Date(data.start);
      const end = new Date(data.end);
      const [range] = await getUserAvailability(
        user,
        new Date(data.start),
        new Date(data.end),
        CALENDAR_FREE_BUSY_API,
      );
      if (+start !== +range.start || +end !== +range.end) {
        return Response.json({
          message: `The given range is not available: ${
            formatTimeRange({ start, end })
          }, ${dateFormatter.format(start)}`,
        }, { status: 400 });
      }
      const resp = await fetch(
        CALENDAR_EVENTS_API.replace(":calendarId", "primary") +
          "?sendUpdates=all",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user.googleAccessToken}`,
          },
          body: JSON.stringify(body),
        },
      );
      const { error } = await resp.json();
      if (!resp.ok) {
        throw new Error(error.message);
      }
      return Response.json({});
    } catch (e) {
      return Response.json({ message: e.message }, { status: 400 });
    }
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
  const [confirmedEvent, setConfirmedEvent] = useState<
    { eventType: EventType; range: Range } | null
  >(null);

  const loadAvailability = async () => {
    const start = date ?? new Date();
    const end = startOfMonth(date, 2);
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
  };

  useEffect(() => {
    loadAvailability();
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

  const onSuccess = (eventType: EventType, range: Range) => {
    setConfirmedEvent({ eventType, range });
    loadAvailability();
  };

  useEffect(() => {
    if (error) {
      redirect("/");
    }
  }, []);
  if (error) {
    return null;
  }
  if (confirmedEvent) {
    return (
      <ConfirmedScreen
        userName={name}
        eventType={confirmedEvent.eventType}
        range={confirmedEvent.range}
      />
    );
  }
  return (
    <div className="mt-5 max-w-screen-xl px-4 m-auto">
      <Link className="text-blue-400" to="../">
        Back
      </Link>
      <div className=" mt-4 w-full grid grid-cols-3 gap-20">
        <div className="border-t border-neutral-600 pt-4">
          <p className="text-neutral-400">{name}</p>
          <p className="mt-4">
            <Badge>{eventType.duration / MIN} min</Badge>
          </p>
          <p className="font-bold">{eventType.title}</p>
          <p className="text-neutral-600 text-sm">{eventType.description}</p>
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
                    onSuccess={onSuccess}
                  />
                </SlidingPanel>
              )}
          </div>
          <div>
            {selectedDate && inRange(selectedDate, start, end) &&
              showCalendar &&
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
  dateStyle: "long",
});
const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour12: false,
  hour: "2-digit",
  minute: "2-digit",
});

function formatTimeRange(range: Range) {
  return timeFormatter.format(range.start) + " - " +
    timeFormatter.format(range.end);
}

type AvailableHourListProps = {
  userName: string;
  ranges: Range[];
  eventType: EventType;
  onSuccess: (eventType: EventType, range: Range) => void;
};

function AvailableHourList(
  { userName, eventType, ranges, onSuccess }: AvailableHourListProps,
) {
  return (
    <div className="flex flex-col py-6 px-6 gap-6 sm:max-h-100 overflow-scroll bg-dark-300 rounded-lg">
      {ranges.map((
        range,
      ) => (
        <BookDialog
          key={+range.start}
          userName={userName}
          eventType={eventType}
          range={range}
          onSuccess={onSuccess}
        >
          <div
            role="button"
            className="w-full border border-neutral-500 rounded-lg py-5 flex justify-center bg-dark-400 hover:bg-dark-100"
          >
            {hourMinuteFormatter.format(range.start)}
          </div>
        </BookDialog>
      ))}
    </div>
  );
}

type BookDialogProps = PropsWithChildren<{
  userName: string;
  eventType: EventType;
  range: Range;
  onSuccess: (eventType: EventType, range: Range) => void;
}>;
function BookDialog(
  { children, userName, eventType, range, onSuccess }: BookDialogProps,
) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [guestEmails, setGuestEmails] = useState("");
  const [description, setDescription] = useState("");
  const [openGuestEmails, setOpenGuestEmails] = useState(false);
  const [updating, setUpdating] = useState(false);
  const disabled = name === "" || email === "" || updating;
  return (
    <Dialog
      title="Enter event details"
      okText="Create"
      okDisabled={disabled}
      onOk={async () => {
        setUpdating(true);
        try {
          const resp = await fetch(location.href, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name,
              email,
              guestEmails,
              description,
              start: range.start,
              end: range.end,
            }),
          });
          const data = await resp.json();
          if (!resp.ok) {
            throw new Error(data.message);
          }
          onSuccess(eventType, range);
        } catch (e) {
          notify({
            type: "danger",
            title: "Failed to book",
            message: `Failed to book the event: ${e.message}`,
          });

          return false;
        } finally {
          setUpdating(false);
        }
      }}
      onCancel={() => {
        setOpenGuestEmails(false);
        setName("");
        setEmail("");
        setGuestEmails("");
        setDescription("");
      }}
      message={
        <div className="mt-6 grid grid-cols-[300px_minmax(400px,_1fr)]">
          <div className="">
            <p className="text-neutral-400">{userName}</p>
            <p>
              <Badge>{eventType.duration / MIN} min</Badge>
            </p>
            <p className="text-2xl font-bold">{eventType.title}</p>
            <p className="mt-4 flex items-center gap-2">
              {dateFormatter.format(range.start)}
            </p>
            <p className="mt-1 text-4xl font-thin">
              {formatTimeRange(range)}
            </p>
          </div>
          <div className="border-l border-neutral-600 pl-4 grid grid-cols-[100px_minmax(300px,_1fr)] gap-4">
            <span className="text-right pt-1">Name *</span>
            <Input
              placeholder="Your name"
              value={name}
              onChange={(value) => setName(value)}
            />
            <span className="text-right pt-1">Email *</span>
            <Input
              placeholder="Your email address"
              value={email}
              onChange={(value) => setEmail(value)}
            />
            {!openGuestEmails && (
              <>
                <span></span>
                <Button
                  style="outline"
                  className="primary"
                  onClick={() => setOpenGuestEmails(true)}
                >
                  <icons.Plus size={12} /> Add guest emails
                </Button>
              </>
            )}
            {openGuestEmails && (
              <>
                <span className="text-right pt-1">Guest Emails</span>

                <textarea
                  className="rounded-md p-2 min-h-20 text-black"
                  placeholder="guest email(s)"
                  onChange={(e) => setGuestEmails(e.target.value)}
                  value={guestEmails}
                />
              </>
            )}
            <span className="text-right pt-1">Description</span>
            <textarea
              className="rounded-md p-2 min-h-20 text-black"
              placeholder="The description"
              onChange={(e) => setDescription(e.target.value)}
              value={description}
            />
          </div>
        </div>
      }
    >
      {children}
    </Dialog>
  );
}

type ConfirmedScreenProps = {
  eventType: EventType;
  range: Range;
  userName: string;
};
function ConfirmedScreen({ eventType, range, userName }: ConfirmedScreenProps) {
  useEffect(() => {
    party.confetti(document.querySelector("#confetti"), {
      count: party.variation.range(20, 40),
    });
  }, []);
  return (
    <div className="mt-5 max-w-screen-sm px-4 m-auto">
      <Link className="text-blue-400" to="../">
        Back
      </Link>
      <div className="mt-10 flex flex-col items-center">
        <h1 className="text-xl font-bold">
          Scheduled an event <span id="confetti">🎉</span>
        </h1>
        <p className="text-neutral-400 text-sm">
          You are scheduled with{" "}
          <span className="font-semibold text-neutral-300">{userName}</span>.
        </p>
        <div className="mt-6 border-t border-b border-neutral-600 py-6 px-10">
          <p className=" text-xl font-medium">
            {eventType.title}
          </p>
          <p className="mt-5">{dateFormatter.format(range.start)}</p>
          <p className="text-2xl font-thin">{formatTimeRange(range)}</p>
        </div>
      </div>
    </div>
  );
}
