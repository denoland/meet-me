// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import { useEffect } from "react";
import { useForwardProps, useRouter } from "aleph/react";
import { type UserForClient as User } from "utils/db.ts";
import EventTypeCard, { NewEventTypeCard } from "shared/EventTypeCard.tsx";

export default function MyPage() {
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
    <div className="max-w-screen-xl px-4 m-auto">
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
