// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import { useState } from "react";
import { MIN } from "utils/datetime.ts";
import { IconButton, IconLink } from "base/Button.tsx";
import Copyable from "base/Copyable.tsx";
import { notify } from "base/Notification.tsx";
import icons from "icons";
import EditEventTypeDialog from "shared/EditEventTypeDialog.tsx";
import { EventType, UserForClient as User } from "utils/db.ts";

export default function EventTypeCard(
  { user, reloadUser, eventType }: {
    user: User;
    reloadUser: () => Promise<void>;
    eventType: EventType;
  },
) {
  const [updating, setUpdating] = useState(false);

  const removeEventTypes = async (idToRemove: string) => {
    setUpdating(true);
    try {
      // deno-lint-ignore no-explicit-any
      let eventTypes: EventType[] = (globalThis as any).structuredClone(
        user.eventTypes,
      );
      eventTypes = eventTypes.filter((et) => et.id !== idToRemove);
      const resp = await fetch("/api/user", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ eventTypes }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        return new Error(data.message);
      }
      await reloadUser();
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

  const eventPath = `/${user.slug}/${eventType.slug || eventType.id}`;
  const eventUrl = `https://meet-me.deno.dev${eventPath}`;

  return (
    <div
      key={eventType.id}
      className="flex flex-col gap-1 rounded-lg border-neutral-700 border px-4 py-7"
    >
      <div className="flex justify-between">
        <div>
          <span className="text-xs font-semibold bg-stone-600 rounded-full px-3 py-0.5 text-xs">
            {Math.floor(eventType.duration / MIN)} min
          </span>
        </div>
        <div className="flex items-center">
          <IconLink href={eventPath} target="_blank">
            <icons.ExternalLink />
          </IconLink>
          <Copyable value={eventUrl} />
          <EditEventTypeDialog
            key={eventType.title + eventType.description + eventType.duration +
              eventType.slug}
            user={user}
            reloadUser={reloadUser}
            eventTypeId={eventType.id}
          >
            <IconButton disabled={updating}>
              <icons.Edit />
            </IconButton>
          </EditEventTypeDialog>
          <IconButton
            onClick={() => {
              if (
                confirm(
                  `Are you sure to delete the event type "${eventType.title}"`,
                )
              ) {
                removeEventTypes(eventType.id);
              }
            }}
            disabled={updating}
          >
            <icons.TrashBin />
          </IconButton>
        </div>
      </div>
      <h2 className="font-bold">{eventType.title}</h2>
      <p className="text-neutral-600 text-sm">
        {eventType.description}
      </p>
    </div>
  );
}

export function NewEventTypeCard(
  { user, reloadUser }: { user: User; reloadUser: () => Promise<void> },
) {
  return (
    <EditEventTypeDialog
      key={user.eventTypes!.length}
      user={user}
      reloadUser={reloadUser}
    >
      <div
        className="flex items-center rounded-lg border-neutral-700 gap-3 border px-6 py-7"
        role="button"
        tabIndex={0}
      >
        <icons.Calendar size={28} />
        <div className="flex flex-col">
          <h3 className="font-bold">+ New Meetings</h3>
          <p className="text-neutral-600 text-sm">
            Create a new event type
          </p>
        </div>
      </div>
    </EditEventTypeDialog>
  );
}
