// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import { PropsWithChildren, useEffect, useState } from "react";
import { useForwardProps, useRouter } from "aleph/react";
import { UserForClient as User } from "utils/db.ts";
import Button from "base/Button.tsx";
import { notify } from "base/Notification.tsx";
import TimeZoneSelect from "shared/TimeZoneSelect.tsx";
import AvailabilitySettings from "shared/AvailabilitySettings.tsx";
import cx from "utils/cx.ts";
import { isValidTimeZone, TimeZone } from "utils/datetime.ts";
import { equal } from "std/testing/asserts.ts";

export default function Settings() {
  const { user, reloadUser } = useForwardProps<
    { user: User; reloadUser: () => Promise<void> }
  >();

  const { redirect } = useRouter();

  useEffect(() => {
    if (!user) {
      redirect("/");
    }
  });

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-screen-md m-auto flex flex-col gap-6 px-4">
      <a className="text-blue-400" href="/mypage">Back</a>
      <SlugSettings user={user} reloadUser={reloadUser} />
      <TimeZoneSettings user={user} reloadUser={reloadUser} />
      <AvailabilitySettingsArea user={user} reloadUser={reloadUser} />
    </div>
  );
}

function SettingsBox(
  { className, children, title, description }: PropsWithChildren<
    { className?: string; title: string; description?: string }
  >,
) {
  return (
    <div className={cx("p-6 rounded-lg bg-dark-300", className)}>
      <h2 className="font-semibold text-lg mb-3">{title}</h2>
      {description && <p className="text-neutral-500 mb-3">{description}</p>}
      {children}
    </div>
  );
}

type SettingsProps = { user: User; reloadUser: () => Promise<void> };

export function SlugSettings({ user, reloadUser }: SettingsProps) {
  const [slug, setSlug] = useState(user.slug || "");
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
      notify({
        title: "URL updated!",
        type: "success",
        message:
          `Your Meet Me URL has been updated to meet-me.deno.dev/${slug}`,
      });
      reloadUser();
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
    <SettingsBox
      title="Meet Me URL"
      description="Choose a URL that describes you or your business in a concise way. Make it short and easy to remember so you can share links with ease."
    >
      <div className="flex items-center gap-2">
        https://meet-me.deno.dev/
        <input
          className="rounded-lg py-2 px-4 text-black"
          placeholder="url"
          onChange={(e) => {
            setSlug(e.target.value);
          }}
          value={slug}
        />
        <Button
          className="ml-4"
          style="primary"
          disabled={updating || slug === user.slug}
          onClick={updateSlug}
        >
          Save
        </Button>
      </div>
    </SettingsBox>
  );
}

export function TimeZoneSettings({ user, reloadUser }: SettingsProps) {
  const initialTimeZone = isValidTimeZone(user.timeZone!)
    ? user.timeZone
    : "Europe/London";
  const [timeZone, setTimeZone] = useState<TimeZone>(initialTimeZone);

  const updateTimeZone = async (timeZone: string) => {
    try {
      const resp = await fetch("/api/user", {
        method: "PATCH",
        body: JSON.stringify({
          timeZone,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message);
      }
      notify({
        title: "Time zone updated!",
        type: "success",
        message: `Your time zone has been updated to ${timeZone}.`,
      });
      reloadUser();
    } catch (e) {
      notify({
        title: "Request failed",
        type: "danger",
        message: e.message,
      });
    }
  };

  return (
    <SettingsBox title="Time Zone" description="Set your time zone.">
      <TimeZoneSelect
        timeZone={timeZone}
        onTimeZoneSelect={(timeZone) => {
          setTimeZone(timeZone);
          updateTimeZone(timeZone);
        }}
      />
    </SettingsBox>
  );
}

export function AvailabilitySettingsArea({ user, reloadUser }: SettingsProps) {
  const [updating, setUpdating] = useState(false);
  const [availabilities, setAvailabilities] = useState(user.availabilities!);

  const updateAvailability = async () => {
    setUpdating(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        body: JSON.stringify({ availabilities }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message);
      }
      notify({
        title: "Availability updated!",
        type: "success",
        message: `Your availability has been updated.`,
      });
      reloadUser();
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
    <SettingsBox title="Availability" description="Set your availability">
      <AvailabilitySettings
        availabilities={availabilities}
        onChange={setAvailabilities}
      />
      <Button
        className="mt-4 float-left"
        style="primary"
        disabled={updating || equal(user.availabilities, availabilities)}
        onClick={updateAvailability}
      >
        Save
      </Button>
    </SettingsBox>
  );
}
