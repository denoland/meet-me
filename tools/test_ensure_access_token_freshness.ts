// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import { parse } from "https://deno.land/std@0.143.0/flags/mod.ts";
import {
  createUserByEmail,
  ensureAccessTokenIsFreshEnough,
  User,
} from "../utils/db.ts";
import { TOKEN_ENDPOINT } from "../utils/const.ts";
import "https://deno.land/std@0.143.0/dotenv/load.ts";

function usage() {
  console.log(
    `Usage: ./tools/test_ensure_access_token_freshness.ts --access-token <token> --refresh-token <token> --expires <date>
Note: This tool checks the behavior of ensureAccessTokenIsFreshEnough function against actual google OAuth token endpoint`,
  );
}

const args = parse(Deno.args, {
  string: ["access-token", "refresh-token", "expires"],
  boolean: ["h"],
});
const accessToken = args["access-token"];
const refreshToken = args["refresh-token"];
const expires = args["expires"];
if (args.h) {
  usage();
  Deno.exit(0);
}
if (!accessToken || !refreshToken || !expires) {
  usage();
  Deno.exit(1);
}
const user: User = {
  id: crypto.randomUUID(),
  email: "foo@example.com",
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
console.log("User before ensuring", user);
await ensureAccessTokenIsFreshEnough(user, TOKEN_ENDPOINT);
console.log("User after ensuring", user);
