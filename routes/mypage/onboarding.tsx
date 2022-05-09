// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import { useForwardProps } from "aleph/react";
import { UserForClient } from "utils/db.ts";

export default function MyPage() {
  const { user } = useForwardProps<{ user: UserForClient }>();
  return (
    <div className="px-8 py-4">
      <h1>
        Welcome to <span className="font-semibold">Meet Me</span>!
      </h1>
      <p className="mt-4">
        You're signed in as <span className="font-semibold">{user.email}</span>
      </p>
      <p className="mt-4">
        You're setting the following elements:
      </p>
      <ul className="mt-4 list-disc px-4">
        <li>
          Your URL{" "}
          <span className="text-gray-400">ex. meet-me.deno.dev/foobar</span>
        </li>
        <li>
          Availabilities{" "}
          <span className="text-gray-400">ex. Mon 9:00 - 17:00 etc</span>
        </li>
        <li>
          Event Types{" "}
          <span className="text-gray-400">ex. 30 minutes meeting</span>
        </li>
      </ul>
      <p className="mt-4">TODO: implement the above</p>
    </div>
  );
}
