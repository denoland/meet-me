// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import { PropsWithChildren, useEffect, useState } from "react";
import { useForwardProps, useRouter } from "aleph/react";
import { UserForClient as User } from "utils/db.ts";
import Button from "base/Button.tsx";
import { notify } from "base/Notification.tsx";
import cx from "utils/cx.ts";

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
      <AvailabilitySettings user={user} reloadUser={reloadUser} />
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

export function TimeZoneSettings({ user }: SettingsProps) {
  return <SettingsBox title="Time Zone">Time Zone Settings</SettingsBox>;
}

export function AvailabilitySettings({ user }: SettingsProps) {
  return <SettingsBox title="Availability">Availability Settings</SettingsBox>;
}
