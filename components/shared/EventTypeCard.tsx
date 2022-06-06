// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import { useState } from "react";
import { MIN } from "utils/datetime.ts";
import Button from "base/Button.tsx";
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
      // TODO(kt3k): better error handling
      alert(e.message);
    } finally {
      setUpdating(false);
    }
  };

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
        <div>
          <EditEventTypeDialog
            key={eventType.title + eventType.description + eventType.duration +
              eventType.slug}
            user={user}
            reloadUser={reloadUser}
            eventTypeId={eventType.id}
          >
            <Button size="xs" disabled={updating}>
              <icons.Edit />
            </Button>
          </EditEventTypeDialog>
          <Button
            size="xs"
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
          </Button>
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
