// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import { validate as uuidValidate } from "std/uuid/v4.ts";
import {
  hourMinuteToSec,
  isValidHourMinute,
  isValidWeekDay,
  MIN,
  WeekDay,
} from "./datetime.ts";

const enc = new TextEncoder();
const dec = new TextDecoder();

/** User represents the signed-in user. */
export type User = {
  id: string;
  email: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
  slug?: string;
  googleRefreshToken?: string;
  googleAccessToken?: string;
  googleAccessTokenExpires?: Date;
  timeZone?: string;
  availabilities?: Range[];
  eventTypes?: EventType[];
};

export type UserForClient = Omit<User, `google${string}`>;

/** EventType is a template of the events, which the users can set up.
 * The visiters can book actual events based on this EventType settings. */
export type EventType = {
  id: string;
  title: string;
  description?: string;
  duration: number;
  /** The slug is used as the last part of the booking page of this event type
   * like `https://meet-me.deno.dev/[user-slug]/[event-type-slug]`.
   */
  slug?: string;
};

export type Range = {
  weekDay: WeekDay;
  startTime: string; // "HH:mm" format
  endTime: string; // "HH:mm" format
};

type Token = {
  id: string;
  hash: string;
  userId: string;
  expires: Date;
};

// These words are not usable as url slugs.
export const unavailableUserSlugs = [
  "mypage",
  "api",
  "index",
  "terms",
  "privacy",
  "signout",
];

// TODO(kt3k): These are temporary DB tables in memory.
// Replace these with actual DB calls later.
/** id -> User */
export const Users: Record<string, User> = {};
/** id -> Token */
export const Tokens: Record<string, Token> = {};

// deno-lint-ignore require-await
export async function getUserById(id: string): Promise<User | undefined> {
  return Users[id];
}

// deno-lint-ignore require-await
export async function getUserByEmail(email: string): Promise<User | undefined> {
  return Object.values(Users).find((u) => u.email === email);
}

function createDefaultCalendarEvent(): EventType {
  return {
    id: crypto.randomUUID(),
    title: "30 Minute Meeting",
    description: "30 minute meeting.",
    duration: 30 * MIN,
    slug: "30min",
  };
}

export function isValidEventType(event: EventType): event is EventType {
  return uuidValidate(event.id) && typeof event.title === "string" &&
    typeof event.duration === "number";
}

// deno-lint-ignore no-explicit-any
export function isValidRange(range: any = {}): range is Range {
  const { weekDay, startTime, endTime } = range;
  return isValidWeekDay(weekDay) &&
    isValidHourMinute(startTime) &&
    isValidHourMinute(endTime) &&
    hourMinuteToSec(endTime)! - hourMinuteToSec(startTime)! > 0;
}

export async function createUserByEmail(email: string): Promise<User> {
  const user = {
    id: crypto.randomUUID(),
    email,
    eventTypes: [createDefaultCalendarEvent()],
  };
  await saveUser(user);
  return user;
}

export async function getOrCreateUserByEmail(email: string): Promise<User> {
  const user = await getUserByEmail(email);
  if (user) {
    return user;
  }
  return createUserByEmail(email);
}

// deno-lint-ignore require-await
export async function getUserBySlug(slug: string): Promise<User | undefined> {
  return Object.values(Users).find((user) => user.slug === slug);
}

// deno-lint-ignore require-await
export async function saveUser(user: User): Promise<void> {
  Users[user.id] = user;
}

/** Returns true if the user's settings are ready to start using Meet Me.
 * This check is used for sending user to onboarding flow. */
export function isUserReady(
  user: Omit<User, "googleRefreshToken"> | undefined,
) {
  if (!user) {
    return false;
  }
  return user.slug !== undefined && user.availabilities !== undefined &&
    user.timeZone !== undefined;
}

export function isUserAuthorized(user: Pick<User, "googleRefreshToken">) {
  return user.googleRefreshToken !== undefined;
}

/** Gets the availability of the user in the given period of time. */
export async function getUserAvailability(user: User, start: Date, end: Date, opts: {
  freeBusyApi: string,
  tokenEndpoint: string,
}) {
  await ensureAccessTokenIsFreshEnough(user, opts.tokenEndpoint);
  const resp = await fetch(opts.freeBusyApi, {
    method: "POST",
    body: JSON.stringify({
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      items: [{ id: user.email }],
    }),
    headers: {
      "Content-Type": "application/json",
    }
  });
  const data = await resp.json();
  const busyRanges = data.calendars[user.email].busy;
  return busyRanges;
}

export async function ensureAccessTokenIsFreshEnough(user: User, tokenEndpoint: string) {
  if (needsAccessTokenRefresh(user)) {
    const params = new URLSearchParams();
    params.append("client_id", Deno.env.get("CLIENT_ID")!);
    params.append("client_secret", Deno.env.get("CLIENT_SECRET")!);
    params.append("refresh_token", user.googleRefreshToken!);
    params.append("grant_type", "refresh_token");
    const resp = await fetch(tokenEndpoint, {
      method: "POST",
      body: params,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      }
    });
    if (!resp.ok) {
      const data = await resp.json();
      throw Error(`Token refresh failed: ${data.error_description}`);
    }
    const body = await resp.json() as {
      access_token: string,
      expires_in: number,
    };
    user.googleAccessToken = body.access_token;
    user.googleAccessTokenExpires = new Date(Date.now() + body.expires_in * 1000);
    await saveUser(user);
  }
}

/** Returns true if the access token needs to be refreshed */
export function needsAccessTokenRefresh(user: Pick<User, "googleAccessTokenExpires">): boolean {
  const expires = user.googleAccessTokenExpires;
  if (!expires) {
    return false;
  }

  // If the access token expires in 10 sec, then returns true.
  return +expires < Date.now() - 10000;
}

// deno-lint-ignore require-await
export async function getTokenByHash(hash: string): Promise<Token | undefined> {
  return Object.values(Tokens).find((t) => t.hash === hash);
}

export async function getUserByToken(token: string) {
  const hash = await sha256(token);
  const tokenObj = await getTokenByHash(hash);
  if (tokenObj) {
    return getUserById(tokenObj.userId);
  }
}

async function sha256(str: string) {
  return dec.decode(
    await crypto.subtle.digest("SHA-256", enc.encode(str)),
  );
}

export async function createNewTokenForUser(user: User): Promise<string> {
  const tokenStr = Math.random().toString(36).slice(2);
  const token = {
    id: crypto.randomUUID(),
    hash: await sha256(tokenStr),
    userId: user.id,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };
  Tokens[token.id] = token;

  return tokenStr;
}
