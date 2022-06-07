// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import { PropsWithChildren, useState } from "react";
import { MIN } from "utils/datetime.ts";
import Input from "base/Input.tsx";
import icons from "icons";
import Dropdown from "base/Dropdown.tsx";
import Dialog from "base/Dialog.tsx";
import { notify } from "base/Notification.tsx";
import { EventType, UserForClient as User } from "utils/db.ts";

export default function EditEventTypeDialog(
  { children, eventTypeId, user, reloadUser }: PropsWithChildren<
    { eventTypeId?: string; user: User; reloadUser: () => Promise<void> }
  >,
) {
  const editIndex = user.eventTypes!.findIndex((et) => et.id === eventTypeId);
  const editEventType = user.eventTypes![editIndex];
  const [updating, setUpdating] = useState(false);
  const [title, setTitle] = useState(editEventType?.title ?? "");
  const [duration, setDuration] = useState(
    typeof editEventType?.duration === "number"
      ? editEventType.duration / MIN
      : 30,
  );
  const [description, setDescription] = useState(
    editEventType?.description ?? "",
  );
  const [slug, setSlug] = useState(editEventType?.slug ?? "");
  const disabled = updating;
  const updateEventTypes = async () => {
    setUpdating(false);
    try {
      // deno-lint-ignore no-explicit-any
      const eventTypes: EventType[] = (globalThis as any).structuredClone(
        user.eventTypes,
      );
      const newEventType = {
        id: eventTypeId ?? crypto.randomUUID(),
        title,
        description,
        duration: duration * MIN,
        slug,
      };
      if (editIndex === -1) {
        eventTypes.push(newEventType);
      } else {
        eventTypes[editIndex] = newEventType;
      }
      const resp = await fetch("/api/user", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ eventTypes }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message);
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
  return (
    <Dialog
      title={editIndex === -1 ? "Create a new Event Type" : "Edit event type"}
      okDisabled={disabled || title === ""}
      onOk={updateEventTypes}
      okText={editIndex === -1 ? "Create" : "Update"}
      message={
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2">
            <div>
              <h3 className="font-semibold text-sm">TITLE</h3>
              <Input
                className="mt-2"
                placeholder="event title"
                onChange={setTitle}
                value={title}
              />
            </div>
            <div>
              <h3 className="font-semibold text-sm">DURATION</h3>
              <Dropdown
                trigger="click"
                render={() => (
                  <ul className="rounded-md py-2 bg-neutral-100">
                    {[...Array(12)].map((_, i) => (
                      <li
                        key={i}
                        className="px-2 py-1 hover:bg-neutral-3 cursor-pointer"
                        onClick={() => setDuration((i + 1) * 15)}
                      >
                        {(i + 1) * 15} mins
                      </li>
                    ))}
                  </ul>
                )}
              >
                <div className="mt-2 flex items-center justify-between bg-neutral-100 rounded-md h-9 px-3 w-30 text-black">
                  {duration} mins
                  <icons.CaretDown />
                </div>
              </Dropdown>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-sm">DESCRIPTION</h3>
            <textarea
              className="mt-2 rounded-md bg-neutral-100 text-black px-3 py-2 w-full"
              placeholder="description"
              onChange={(e) => {
                setDescription(e.target.value);
              }}
            >
              {description}
            </textarea>
          </div>
          <div className="mb-3">
            <h3>URL</h3>
            <p className="text-neutral-500">Choose your event's url</p>
            <p className="flex items-center gap-2">
              https://meet-me.deno.dev/{user.slug}/{" "}
              <Input placeholder="url" onChange={setSlug} value={slug} />
            </p>
          </div>
        </div>
      }
    >
      {children}
    </Dialog>
  );
}
