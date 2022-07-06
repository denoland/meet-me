// Copyright 2022 the Deno authors. All rights reserved. MIT license.
/** @jsxImportSource https://esm.sh/react@18.1.0 */

import { useEffect, useState } from "react";
import { useForwardProps, useRouter } from "aleph/react";
import Button from "base/Button.tsx";
import icons from "icons";
import SlidingPanel, { PanelState } from "base/SlidingPanel.tsx";
import { notify } from "base/Notification.tsx";
import TimeZoneSelect from "shared/TimeZoneSelect.tsx";
import AvailabilitySettings from "shared/AvailabilitySettings.tsx";
import EventTypeCard, { NewEventTypeCard } from "shared/EventTypeCard.tsx";
import { UserForClient as User } from "utils/db.ts";
import { WeekRange } from "utils/datetime.ts";
import { delay } from "std/async/delay.ts";

const STEPS = ["slug", "availability", "eventType"] as const;
type Step = (typeof STEPS)[number];

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
  }, []);

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
        <SlidingPanel className="w-screen" state={panelState}>
          <ChooseURL
            slug={user.slug || ""}
            onFinish={goForward}
          />
        </SlidingPanel>
      )}
      {step === "availability" && (
        <SlidingPanel className="w-screen" state={panelState}>
          <ChooseAvailabilities
            user={user}
            onCancel={goBack}
            onFinish={goForward}
          />
        </SlidingPanel>
      )}
      {step === "eventType" && (
        <SlidingPanel className="w-screen" state={panelState}>
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
      notify({
        title: "Request failed",
        type: "danger",
        message: e.message,
      });
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

      <div className="mt-8 flex flex-col gap-4 border rounded-lg border-neutral-700 py-8 px-8 max-w-lg mx-auto">
        <h2 className="font-medium text-lg">
          Create your Meet Me URL{" "}
          <span className="ml-2 text-sm font-normal text-neutral-600">
            (step 1 of 3)
          </span>
        </h2>
        <p className="text-neutral-500">
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

const DEFAULT_AVAILABILITIES: WeekRange[] = [
  { weekDay: "MON" as const, startTime: "09:00", endTime: "17:00" },
  { weekDay: "TUE" as const, startTime: "09:00", endTime: "17:00" },
  { weekDay: "WED" as const, startTime: "09:00", endTime: "17:00" },
  { weekDay: "THU" as const, startTime: "09:00", endTime: "17:00" },
  { weekDay: "FRI" as const, startTime: "09:00", endTime: "17:00" },
];

function ChooseAvailabilities(
  { user, onCancel, onFinish }: {
    user: User;
    onCancel: () => void;
    onFinish: () => void;
  },
) {
  const [updating, setUpdating] = useState(false);
  const [timeZone, setTimeZone] = useState("");

  const [availabilities, setAvailabilities] = useState(
    user.availabilities ?? DEFAULT_AVAILABILITIES,
  );

  useEffect(() => {
    setTimeZone(
      // Set the system's default time zone as default
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
          availabilities,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message);
      }
      onFinish();
    } catch (e) {
      notify({
        title: "Request failed",
        type: "danger",
        message: e.message,
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 border rounded-lg border-neutral-700 py-8 px-8 max-w-xl mx-auto">
      <h2 className="font-medium text-lg">
        Set your availability{" "}
        <span className="ml-2 text-sm font-normal text-neutral-600">
          (step 2 of 3)
        </span>
      </h2>
      <TimeZoneSelect
        timeZone={timeZone}
        onTimeZoneSelect={(timeZone) => setTimeZone(timeZone)}
      />
      <AvailabilitySettings
        availabilities={availabilities}
        onChange={setAvailabilities}
      />
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

function SetUpEventType({ user, onCancel, onFinish, reloadUser }: {
  user: User;
  onCancel: () => void;
  onFinish: () => void;
  reloadUser: () => Promise<void>;
}) {
  const eventTypes = user.eventTypes!;
  const { redirect } = useRouter();
  return (
    <div className="flex flex-col gap-4 border rounded-lg border-neutral-700 py-8 px-8 max-w-4xl mx-auto">
      <h2 className="font-medium text-lg">
        Set up event types{" "}
        <span className="ml-2 text-sm font-normal text-neutral-600">
          (step 3 of 3)
        </span>
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {eventTypes.map((eventType) => (
          <EventTypeCard
            key={eventType.id}
            user={user}
            reloadUser={reloadUser}
            eventType={eventType}
          />
        ))}
        <NewEventTypeCard user={user} reloadUser={reloadUser} />
      </div>
      <div className="self-end flex items-center gap-2 mt-4">
        <Button
          style="alternate"
          onClick={onCancel}
        >
          Back
        </Button>
        <Button
          style="primary"
          onClick={async () => {
            await onFinish();
            notify({
              title: "Settings are completed",
              type: "success",
              message: "You successfully completed the initial settings!",
            });
            redirect("/mypage", true);
          }}
        >
          Finish
        </Button>
      </div>
    </div>
  );
}
