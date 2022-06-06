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
  googleAccessTokenExpres?: Date;
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

export function isUserReady(user: Omit<User, "googleRefreshToken">) {
  return user.slug !== undefined && user.availabilities !== undefined &&
    user.timeZone !== undefined;
}

export function isUserAuthorized(user: Pick<User, "googleRefreshToken">) {
  return user.googleRefreshToken !== undefined;
}

// deno-lint-ignore require-await
export async function getTokenByHash(hash: string) {
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
