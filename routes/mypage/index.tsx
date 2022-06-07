// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import { useForwardProps } from "aleph/react";
import { UserForClient as User } from "utils/db.ts";
import EventTypeCard, { NewEventTypeCard } from "shared/EventTypeCard.tsx";

export default function MyPage() {
  const { user, reloadUser } = useForwardProps<
    { user: User; reloadUser: () => Promise<void> }
  >();
  return (
    <div className="max-w-screen-xl px-4 m-auto">
      <div className="mt-4 flex items-center gap-3">
        <img src={user.picture} className="rounded-full h-10 w-10" />
        <div className="flex flex-col gap-1 text-sm">
          <p>{user.name}</p>
          <p>
            <a className="text-blue-400" href={`/${user.slug}`} target="_blank">
              meet-me.deno.dev/{user.slug}
            </a>
          </p>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-3">
        {user.eventTypes!.map((et) => (
          <EventTypeCard
            key={et.id}
            eventType={et}
            user={user}
            reloadUser={reloadUser}
          />
        ))}
        <NewEventTypeCard user={user} reloadUser={reloadUser} />
      </div>
    </div>
  );
}
