// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import { useEffect, useState } from "react";
import { useForwardProps, useRouter } from "aleph/react";
import {
  HOUR,
  hourMinuteToSec,
  MIN,
  secToHourMinute,
  WeekDay,
} from "utils/datetime.ts";
import Button from "base/Button.tsx";
import Input from "base/Input.tsx";
import icons from "icons";
import cx from "utils/cx.ts";
import { Range, UserForClient } from "utils/db.ts";

type Step = "slug" | "availability";

export default function OnboardingPage() {
  const { user, reloadUser } = useForwardProps<
    { user: UserForClient; reloadUser: () => Promise<void> }
  >();
  const { redirect } = useRouter();
  const [step, setStep] = useState<Step>("slug");
  const [goingForward, setGoingForward] = useState(true);
  useEffect(() => {
    if (!user) {
      redirect("/");
    }
  });

  if (!user) {
    return null;
  }

  return (
    <div className="px-8">
      {step === "slug" && (
        <ChooseURL
          key={1}
          slug={user.slug || ""}
          goingForward={goingForward}
          onFinish={() => {
            reloadUser();
            setStep("availability");
            setGoingForward(true);
          }}
        />
      )}
      {step === "availability" && (
        <ChooseAvailabilities
          key={2}
          goingForward={goingForward}
          onCancel={() => {
            setStep("slug");
            setGoingForward(false);
          }}
        />
      )}
    </div>
  );
}

function ChooseURL(
  { goingForward, slug: slugDefault, onFinish }: {
    goingForward: boolean;
    slug: string;
    onFinish: () => void;
  },
) {
  const [slug, setSlug] = useState(slugDefault);
  const [fadingOut, setFadingOut] = useState(!goingForward);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setFadingOut(false);
    });
  }, []);

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
      setFadingOut(true);
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
      onFinish();
    } catch (e) {
      alert(e.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div
      className={cx("absolute w-screen !transition-500", {
        "opacity-0": fadingOut,
        "!-translate-x-5": fadingOut,
      })}
    >
      {goingForward && (
        <div className="max-w-md mx-auto">
          <h1 className="text-lg">
            Welcome to <span className="font-semibold">Meet Me</span>!
          </h1>
        </div>
      )}
      <div className="mt-8 flex flex-col gap-4 border rounded-lg border-gray-600 py-8 px-8 max-w-lg mx-auto">
        <h2 className="font-medium text-lg">Create your Meet Me URL</h2>
        <p className="text-gray-500">
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
    </div>
  );
}

const WEEK_DEFAULTS = [];

function ChooseAvailabilities(
  { onCancel, goingForward }: { goingForward: boolean; onCancel: () => void },
) {
  const [updating, setUpdating] = useState(false);
  const updateAvailabilities = async () => {
    setUpdating(true);
    try {
      // TODO(kt3k): call patch /api/user
      await Promise.resolve();
    } catch (e) {
      console.log(e);
    } finally {
      setUpdating(false);
    }
  };
  const [fadingOut, setFadingOut] = useState(!goingForward);
  const [fadingIn, setFadingIn] = useState(goingForward);
  const [timeZone, setTimeZone] = useState("");
  useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setTimeout(() => {
      setFadingIn(false);
      setFadingOut(false);
    });
  }, []);
  const onBack = async () => {
    setFadingIn(true);
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
    onCancel();
  };
  return (
    <div
      className={cx("absolute w-screen !transition-500", {
        "opacity-0": fadingOut || fadingIn,
        "!-translate-x-5": fadingOut,
        "!translate-x-5": fadingIn,
      })}
    >
      <div className="flex flex-col gap-4 border rounded-lg border-gray-600 py-8 px-8 max-w-xl mx-auto">
        <h2 className="font-medium text-lg">Set your availability</h2>
        <p className="text-gray-500">
          Timezone: {timeZone}
        </p>
        <ul>
          <WeekRow weekDay="SUN" />
          <WeekRow
            weekDay="MON"
            defaultRanges={[{ startTime: "09:00", endTime: "17:00" }]}
          />
          <WeekRow
            weekDay="TUE"
            defaultRanges={[{ startTime: "09:00", endTime: "17:00" }]}
          />
          <WeekRow
            weekDay="WED"
            defaultRanges={[{ startTime: "09:00", endTime: "17:00" }]}
          />
          <WeekRow
            weekDay="THU"
            defaultRanges={[{ startTime: "09:00", endTime: "17:00" }]}
          />
          <WeekRow
            weekDay="FRI"
            defaultRanges={[{ startTime: "09:00", endTime: "17:00" }]}
          />
          <WeekRow weekDay="SAT" />
        </ul>
        <div className="self-end flex items-center gap-2 mt-4">
          <Button
            disabled={updating}
            style="alternate"
            onClick={onBack}
          >
            Back
          </Button>
          <Button
            disabled={updating || true}
            style="primary"
            onClick={updateAvailabilities}
          >
            Continue
            <icons.CaretRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

function WeekRow(
  { weekDay, defaultRanges }: {
    weekDay: WeekDay;
    defaultRanges?: Omit<Range, "weekDay">[] | undefined;
  },
) {
  const [ranges, setRanges] = useState(defaultRanges || []);
  const noRanges = ranges.length === 0;

  // deno-lint-ignore no-explicit-any
  const onChange = (e: any, type: "startTime" | "endTime", i: number) =>
    setRanges((ranges) => {
      const result = [...ranges];
      result[i] = { ...ranges[i], [type]: e.target.value };
      return result;
    });

  const onRemove = (i: number) =>
    setRanges((ranges) => {
      const result = [...ranges];
      result.splice(i, 1);
      return result;
    });

  const onPlus = () =>
    setRanges((ranges) => {
      const lastRange = ranges.at(-1);
      if (!lastRange) {
        return [{ startTime: "09:00", endTime: "17:00" }];
      }
      const lastEndTime = hourMinuteToSec(lastRange.endTime)!;
      const newStartTime = Math.min(lastEndTime + HOUR, 24 * HOUR - MIN);
      const newEndTime = Math.min(newStartTime + HOUR, 24 * HOUR - MIN);
      const newRange = {
        startTime: secToHourMinute(newStartTime),
        endTime: secToHourMinute(newEndTime),
      };
      return [...ranges, newRange];
    });

  return (
    <div
      className={cx(
        "flex justify-between px-4 py-2 border-b border-gray-700",
      )}
    >
      {noRanges && (
        <>
          <div className="flex items-center gap-4">
            <span className="w-10">{weekDay}</span>
            <span className="text-gray-500">Unavailable</span>
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
                  onChange={(e) =>
                    onChange(e, "startTime", i)}
                />
                ~
                <Input
                  className="w-24"
                  value={endTime}
                  onChange={(e) =>
                    onChange(e, "endTime", i)}
                />
                <Button size="xs" style="none" onClick={() => onRemove(i)}>
                  <icons.TrashBin />
                </Button>
              </div>
              <div>
                <Button style="outline" size="xs" onClick={onPlus}>
                  <icons.Plus size={11} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
