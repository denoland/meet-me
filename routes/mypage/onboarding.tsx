// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import { PropsWithChildren, useEffect, useState } from "react";
import { useForwardProps, useRouter } from "aleph/react";
import {
  HOUR,
  hourMinuteToSec,
  MIN,
  secToHourMinute,
  timeZones,
  WeekDay,
} from "utils/datetime.ts";
import Button from "base/Button.tsx";
import Input from "base/Input.tsx";
import icons from "icons";
import Dropdown from "base/Dropdown.tsx";
import cx from "utils/cx.ts";
import { EventType, Range, UserForClient as User } from "utils/db.ts";
import { delay } from "std/async/delay.ts";

const STEPS = ["slug", "availability", "eventType"] as const;
type Step = (typeof STEPS)[number];
type PanelState = "left" | "center" | "right";

export default function OnboardingPage() {
  const { user, reloadUser } = useForwardProps<
    { user: User; reloadUser: () => Promise<void> }
  >();
  const { redirect } = useRouter();
  const [step, setStep] = useState<Step>("slug");
  const [panelState, setPanelState] = useState<PanelState>("center");

  useEffect(() => {
    if (!user) {
      redirect("/");
    }
  });

  const goForward = async () => {
    setPanelState("right");
    await delay(1000);
    await reloadUser();
    setPanelState("left");
    setStep(STEPS[STEPS.indexOf(step) + 1]);
    await delay(0);
    setPanelState("center");
  };

  const goBack = async () => {
    setPanelState("left");
    await delay(1000);
    await reloadUser();
    setPanelState("right");
    setStep(STEPS[STEPS.indexOf(step) - 1]);
    await delay(0);
    setPanelState("center");
  };

  if (!user) {
    return null;
  }

  return (
    <div>
      {step === "slug" && (
        <SlidingPanel state={panelState}>
          <ChooseURL
            slug={user.slug || ""}
            onFinish={goForward}
          />
        </SlidingPanel>
      )}
      {step === "availability" && (
        <SlidingPanel state={panelState}>
          <ChooseAvailabilities
            user={user}
            onCancel={goBack}
            onFinish={goForward}
          />
        </SlidingPanel>
      )}
      {step === "eventType" && (
        <SlidingPanel state={panelState}>
          <SetUpEventType
            user={user}
            onCancel={goBack}
            onFinish={goForward}
            reloadUser={reloadUser}
          />
        </SlidingPanel>
      )}
    </div>
  );
}

function SlidingPanel(
  { state, children }: PropsWithChildren<{ state: PanelState }>,
) {
  return (
    <div
      className={cx("w-screen !transition-500", {
        "opacity-0": state !== "center",
        "!-translate-x-5": state === "right",
        "!translate-x-5": state === "left",
      })}
    >
      {children}
    </div>
  );
}

function ChooseURL(
  { slug: slugDefault, onFinish }: {
    slug: string;
    onFinish: () => void;
  },
) {
  const [slug, setSlug] = useState(slugDefault);
  const [updating, setUpdating] = useState(false);

  const updateSlug = async () => {
    setUpdating(true);
    try {
      // TODO(kt3k): Use some API updating utility
      const res = await fetch("/api/user", {
        method: "PATCH",
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message);
      }
      onFinish();
    } catch (e) {
      alert(e.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <div className="max-w-md mx-auto">
        <h1 className="text-lg">
          Welcome to <span className="font-semibold">Meet Me</span>!
        </h1>
      </div>

      <div className="mt-8 flex flex-col gap-4 border rounded-lg border-stone-700 py-8 px-8 max-w-lg mx-auto">
        <h2 className="font-medium text-lg">
          Create your Meet Me URL{" "}
          <span className="ml-2 text-sm font-normal text-stone-600">
            (step 1 of 3)
          </span>
        </h2>
        <p className="text-stone-500">
          Choose a URL that describes you or your business in a concise way.
          Make it short and easy to remember so you can share links with ease.
        </p>
        <div className="flex items-center gap-2">
          <span>https://meet-me.deno.dev/</span>
          <input
            className="rounded-lg py-2 px-4 text-black"
            placeholder="url"
            onChange={(e) => {
              setSlug(e.target.value);
            }}
            value={slug}
          />
        </div>
        <div className="self-end mt-4">
          <Button
            disabled={slug === "" || updating}
            style="primary"
            onClick={updateSlug}
          >
            Continue
            <icons.CaretRight />
          </Button>
        </div>
      </div>
    </>
  );
}

const DEFAULT_AVAILABILITIES: Range[] = [
  { weekDay: "MON" as const, startTime: "09:00", endTime: "17:00" },
  { weekDay: "TUE" as const, startTime: "09:00", endTime: "17:00" },
  { weekDay: "WED" as const, startTime: "09:00", endTime: "17:00" },
  { weekDay: "THU" as const, startTime: "09:00", endTime: "17:00" },
  { weekDay: "FRI" as const, startTime: "09:00", endTime: "17:00" },
];

function rangesToRangeMap(ranges: Range[]): Record<WeekDay, Range[]> {
  return {
    SUN: ranges.filter((range) => range.weekDay === "SUN"),
    MON: ranges.filter((range) => range.weekDay === "MON"),
    TUE: ranges.filter((range) => range.weekDay === "TUE"),
    WED: ranges.filter((range) => range.weekDay === "WED"),
    THU: ranges.filter((range) => range.weekDay === "THU"),
    FRI: ranges.filter((range) => range.weekDay === "FRI"),
    SAT: ranges.filter((range) => range.weekDay === "SAT"),
  };
}

function ChooseAvailabilities(
  { user, onCancel, onFinish }: {
    user: User;
    onCancel: () => void;
    onFinish: () => void;
  },
) {
  const [updating, setUpdating] = useState(false);
  const [timeZone, setTimeZone] = useState("");

  const [ranges, setRanges] = useState(
    rangesToRangeMap(user.availabilities ?? DEFAULT_AVAILABILITIES),
  );
  useEffect(() => {
    setTimeZone(
      user.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    );
  }, []);

  const updateAvailabilities = async () => {
    setUpdating(true);
    try {
      const resp = await fetch("/api/user", {
        method: "PATCH",
        body: JSON.stringify({
          timeZone,
          availabilities: Object.values(ranges).flat(),
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message);
      }
      onFinish();
    } catch (e) {
      // TODO(kt3k): handle error correctly
      console.error(e);
      alert(e.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 border rounded-lg border-stone-700 py-8 px-8 max-w-xl mx-auto">
      <h2 className="font-medium text-lg">
        Set your availability{" "}
        <span className="ml-2 text-sm font-normal text-stone-600">
          (step 2 of 3)
        </span>
      </h2>
      <p className="text-stone-400">
        Timezone:{" "}
        <Dropdown
          trigger="click"
          offset={4}
          render={() => (
            <div className="bg-white shadow-lg rounded-lg py-2 h-48 overflow-scroll">
              <ul>
                {timeZones.map((timeZone) => (
                  <li
                    key={timeZone}
                    className="cursor-pointer hover:bg-neutral-100 px-2 py-1"
                    onClick={() => {
                      setTimeZone(timeZone);
                    }}
                  >
                    {timeZone}
                  </li>
                ))}
              </ul>
            </div>
          )}
        >
          <span className="text-white underline cursor-pointer">
            {timeZone}
          </span>
        </Dropdown>
      </p>
      <ul>
        {Object.entries(ranges).map(([weekDay, ranges]) => (
          <WeekRow
            key={weekDay}
            weekDay={weekDay as WeekDay}
            defaultRanges={ranges}
            onRangeUpdate={(ranges) =>
              setRanges((r) => ({ ...r, [weekDay]: ranges }))}
          />
        ))}
      </ul>
      <div className="self-end flex items-center gap-2 mt-4">
        <Button
          disabled={updating}
          style="alternate"
          onClick={onCancel}
        >
          Back
        </Button>
        <Button
          disabled={updating}
          style="primary"
          onClick={updateAvailabilities}
        >
          Continue
          <icons.CaretRight />
        </Button>
      </div>
    </div>
  );
}

function WeekRow(
  { weekDay, defaultRanges, onRangeUpdate }: {
    weekDay: WeekDay;
    defaultRanges?: Omit<Range, "weekDay">[] | undefined;
    onRangeUpdate: (ranges: Omit<Range, "weekDay">[]) => void;
  },
) {
  const [ranges, setRanges] = useState(defaultRanges || []);
  const noRanges = ranges.length === 0;

  const onChange = (v: string, type: "startTime" | "endTime", i: number) =>
    setRanges((ranges) => {
      const result = [...ranges];
      result[i] = { ...ranges[i], [type]: v };
      onRangeUpdate(result);
      return result;
    });

  const onRemove = (i: number) =>
    setRanges((ranges) => {
      const result = [...ranges];
      result.splice(i, 1);
      onRangeUpdate(result);
      return result;
    });

  const onPlus = () =>
    setRanges((ranges) => {
      const lastRange = ranges.at(-1);
      if (!lastRange) {
        return [{ weekDay, startTime: "09:00", endTime: "17:00" }];
      }
      const lastEndTime = hourMinuteToSec(lastRange.endTime)!;
      const newStartTime = Math.min(lastEndTime + HOUR, 24 * HOUR - 15 * MIN);
      const newEndTime = Math.min(newStartTime + HOUR, 24 * HOUR - 15 * MIN);
      const newRange = {
        weekDay,
        startTime: secToHourMinute(newStartTime),
        endTime: secToHourMinute(newEndTime),
      };
      const result = [...ranges, newRange];
      onRangeUpdate(result);
      return result;
    });

  return (
    <div
      className={cx(
        "flex justify-between px-4 py-2 border-b border-stone-700",
      )}
    >
      {noRanges && (
        <>
          <div className="flex items-center gap-4">
            <span className="w-10">{weekDay}</span>
            <span className="text-stone-600">Unavailable</span>
          </div>
          <div>
            <Button style="outline" size="xs" onClick={onPlus}>
              <icons.Plus size={11} />
            </Button>
          </div>
        </>
      )}
      {!noRanges && (
        <div className="flex flex-col w-full gap-3">
          {ranges.map(({ startTime, endTime }, i) => (
            <div className="flex items-center justify-between" key={i}>
              <div className="flex items-center gap-2">
                <span className="w-10">{i === 0 && weekDay}</span>
                <Input
                  className="w-24 text-center"
                  value={startTime}
                  onChange={(v) =>
                    onChange(v, "startTime", i)}
                />
                ~
                <Input
                  className="w-24"
                  value={endTime}
                  onChange={(v) =>
                    onChange(v, "endTime", i)}
                />
                <Button size="xs" style="none" onClick={() => onRemove(i)}>
                  <icons.TrashBin />
                </Button>
              </div>
              <div>
                {i === 0 && (
                  <Button style="outline" size="xs" onClick={onPlus}>
                    <icons.Plus size={11} />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SetUpEventType({ user, onCancel, onFinish, reloadUser }: {
  user: User;
  onCancel: () => void;
  onFinish: () => void;
  reloadUser: () => Promise<void>;
}) {
  const eventTypes = user.eventTypes!;
  const [updating, setUpdating] = useState(false);

  const updateEventTypes = () => {
    alert("TODO(kt3k): finish onboarding!");
  };

  return (
    <div className="flex flex-col gap-4 border rounded-lg border-stone-700 py-8 px-8 max-w-4xl mx-auto">
      <h2 className="font-medium text-lg">
        Set up event types{" "}
        <span className="ml-2 text-sm font-normal text-stone-600">
          (step 3 of 3)
        </span>
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {eventTypes.map((eventType) => (
          <div className="flex flex-col gap-1 rounded-lg border-stone-700 border px-4 py-7">
            <div className="flex justify-between">
              <div>
                <span className="text-xs font-semibold bg-stone-600 rounded-full px-3 py-0.5 text-xs">
                  {Math.floor(eventType.duration / MIN)} min
                </span>
              </div>
              <div>
                <Button
                  size="xs"
                  onClick={() => alert("TODO: Edit Event Type")}
                >
                  <icons.Edit />
                </Button>
                <Button
                  size="xs"
                  onClick={() => alert("TODO: Remove Event Type")}
                >
                  <icons.TrashBin />
                </Button>
              </div>
            </div>
            <h2 className="font-bold">{eventType.title}</h2>
            <p className="text-neutral-600 text-sm">
              {eventType.description}
            </p>
          </div>
        ))}
        <div
          className="flex items-center rounded-lg border-stone-700 gap-3 border px-6"
          role="button"
          tabIndex={0}
          onClick={() => alert("TODO: Open dialog and create event type")}
        >
          <icons.Calendar size={28} />
          <div className="flex flex-col">
            <h3 className="font-bold">+ New Meetings</h3>
            <p className="text-neutral-600 text-sm">
              Create a new event type
            </p>
          </div>
        </div>
      </div>
      <div className="self-end flex items-center gap-2 mt-4">
        <Button
          disabled={updating}
          style="alternate"
          onClick={onCancel}
        >
          Back
        </Button>
        <Button
          disabled={updating}
          style="primary"
          onClick={updateEventTypes}
        >
          Finish
        </Button>
      </div>
    </div>
  );
}
