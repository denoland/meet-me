// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import { parse } from "https://deno.land/std@0.143.0/flags/mod.ts";
import { getUserAvailability, User } from "../utils/db.ts";
import { CALENDAR_FREE_BUSY_API, TOKEN_ENDPOINT } from "../utils/const.ts";
import "https://deno.land/std@0.143.0/dotenv/load.ts";

function usage() {
  console.log(
    `Usage: ./tools/test_get_user_availability.ts --start <date> --end <date> --email <email> --access-token <token> --refresh-token <token> --expires <date>
Note: This tool checks the behavior of getUserAvailability function against actual google OAuth token endpoint`,
  );
}

const args = parse(Deno.args, {
  string: ["access-token", "refresh-token", "expires", "start", "end", "email"],
  boolean: ["h"],
});
const start = args.start;
const end = args.end;
const email = args.email;
const accessToken = args["access-token"];
const refreshToken = args["refresh-token"];
const expires = args.expires;
if (args.h) {
  usage();
  Deno.exit(0);
}
if (!accessToken || !refreshToken || !expires || !start || !end) {
  usage();
  Deno.exit(1);
}
const user: User = {
  id: crypto.randomUUID(),
  email,
  name: "test user",
  givenName: "test",
  familyName: "user",
  picture: "avatar.png",
  slug: "foo",
  googleRefreshToken: args["refresh-token"],
  googleAccessToken: args["access-token"],
  googleAccessTokenExpires: new Date(args["expires"]),
  timeZone: "Europe/London",
  availabilities: [],
  eventTypes: [],
};
const availability = await getUserAvailability(
  user,
  new Date(start),
  new Date(end),
  {
    tokenEndpoint: TOKEN_ENDPOINT,
    freeBusyApi: CALENDAR_FREE_BUSY_API,
  },
);
console.log(availability);
