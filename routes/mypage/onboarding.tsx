// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import { useEffect, useState } from "react";
import { useForwardProps, useRouter } from "aleph/react";
import Button from "base/Button.tsx";
import Input from "base/Input.tsx";
import icons from "icons";
import cx from "utils/cx.ts";
import { Range, UserForClient } from "utils/db.ts";
import { WeekDay } from "utils/datetime.ts";

type Step = "slug" | "availability";

export default function OnboardingPage() {
  const { user, reloadUser } = useForwardProps<
    { user: UserForClient; reloadUser: () => Promise<void> }
  >();
  console.log("user", user);
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
    <div className="px-8 py-4">
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
  const updateAvailabilities = () => {};
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
      <div className="mt-8 flex flex-col gap-4 border rounded-lg border-gray-600 py-8 px-8 max-w-xl mx-auto">
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
        <p className="text-gray-500">
          TODO(kt3k): Enable Availability Ranges set up
        </p>
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
  return (
    <div
      className={cx(
        "flex items-center justify-between px-4 py-2 border-b border-gray-700",
      )}
    >
      <div className="flex items-center gap-2">
        <span className="w-10">{weekDay}</span>
        {noRanges && <span className="text-gray-500">Unavailable</span>}
        {!noRanges && ranges.map(({ startTime, endTime }, i) => (
          <>
            <Input value={startTime} onChange={() => {}} />
            ~
            <Input value={endTime} />
            <span>
              <icons.TrashBin />
            </span>
          </>
        ))}
      </div>
      <div>
        <Button style="alternate">+</Button>
      </div>
    </div>
  );
}
