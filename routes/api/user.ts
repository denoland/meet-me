// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import { badRequest, ok } from "utils/api.ts";
import {
  createNewTokenForUser,
  getOrCreateUserByEmail,
  getUserBySlug,
  getUserByToken,
  isValidEventType,
  isValidRange,
  saveUser,
  unavailableUserSlugs,
} from "utils/db.ts";
import { isValidTimeZone } from "utils/datetime.ts";

/** Gets a user. Used only for testing.
 *
 * TODO(kt3k): Disable/remove this on production */
export const GET = async (_req: Request, ctx: Context) => {
  const token = ctx.cookies.get("token");

  if (!token) {
    return badRequest("No session token is given.");
  }

  const user = await getUserByToken(token);
  return ok(user);
};

/** Creates a user. Used only for testing.
 *
 * TODO(kt3k): Disable/remove this on production */
export const POST = async (req: Request) => {
  const { email } = await req.json();
  const user = await getOrCreateUserByEmail(email);
  const token = await createNewTokenForUser(user);
  return ok({ token });
};

/** Updates user's info */
export const PATCH = async (req: Request, ctx: Context) => {
  const token = ctx.cookies.get("token");

  if (!token) {
    return badRequest("No session token is given.");
  }

  const user = await getUserByToken(token);
  if (!user) {
    return badRequest("There's no user for the given token");
  }

  const { slug, eventTypes, timeZone, availabilities } = await req.json();
  // Updates slug
  if (slug) {
    if (!/^[0-9A-Za-z-_]+$/.test(slug)) {
      return badRequest(
        `The given slug "${slug}" includes invalid characters. The slug can contain only alphabets, numbers, -, and _.`,
      );
    }
    if (unavailableUserSlugs.includes(slug)) {
      return badRequest(`The given slug "${slug}" is not available`);
    }
    const someoneThatHasSlug = await getUserBySlug(slug);
    if (someoneThatHasSlug && someoneThatHasSlug.id !== user.id) {
      return badRequest(`The given slug "${slug}" is not available`);
    }
    user.slug = slug;
  }

  // Updates eventTypes
  if (eventTypes) {
    if (!Array.isArray(eventTypes)) {
      return badRequest(
        `"eventTypes" need to be an array. "${typeof eventTypes}" was given.`,
      );
    }

    const slugs = new Set();
    for (const eventType of eventTypes) {
      if (!isValidEventType(eventType)) {
        return badRequest(
          `The given eventType is invalid: ${JSON.stringify(eventType)}.`,
        );
      }
      const { slug } = eventType;
      if (!slug) {
        continue;
      }
      if (slugs.has(slug)) {
        return badRequest(
          `More than 1 event type have the same url slug: ${slug}.`,
        );
      }
      slugs.add(slug);
    }
    // eventType.slug has to be unique
    user.eventTypes = eventTypes;
  }

  // Updates timeZone
  if (timeZone) {
    if (!isValidTimeZone(timeZone)) {
      return badRequest(`The given "timeZone" is invalid: ${timeZone}`);
    }
    user.timeZone = timeZone;
  }

  // Updates availabilities
  if (availabilities) {
    if (!Array.isArray(availabilities)) {
      return badRequest(
        `"availabilities" need to be an array. "${typeof eventTypes}" was given.`,
      );
    }

    for (const range of availabilities) {
      if (!isValidRange(range)) {
        return badRequest(
          `The given "range" is invalid: ${JSON.stringify(range)}`,
        );
      }
    }
    user.availabilities = availabilities;
  }

  await saveUser(user);
  return ok();
};
