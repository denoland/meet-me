// Copyright 2022 the Deno authors. All rights reserved. MIT license.

const enc = new TextEncoder();
const dec = new TextDecoder();

type User = {
  id: string;
  email: string;
  slug?: string;
  googleApiRefreshToken?: string;
  timezone?: string;
  availabilities?: Range[];
  events?: CalendarEvent[];
};

type WeekDay =
  | "SUN"
  | "MON"
  | "TUE"
  | "WED"
  | "THU"
  | "FRI"
  | "SAT";

type CalendarEvent = {
  summary: string;
  duration: number;
};

type Range = {
  weekDay: WeekDay;
  startTime: string;
  endTime: string;
};

type Token = {
  id: string;
  hash: string;
  userId: string;
  expires: Date;
};

// TODO(kt3k): These are temporary DB tables in memory.
// Replace these with actual DB calls later.
/** id -> User */
export const Users: Record<string, User> = {};
/** id -> Token */
export const Tokens: Record<string, Token> = {};

// deno-lint-ignore require-await
export async function getUserById(id: string) {
  return Users[id];
}

// deno-lint-ignore require-await
export async function getUserByEmail(email: string) {
  return Object.values(Users).find((u) => u.email === email);
}

export function isUserReady(user: Omit<User, "googleApiRefreshToken">) {
  return user.slug !== undefined && user.availabilities !== undefined &&
    user.timezone !== undefined && user.events !== undefined;
}

export function isUserAuthorized(user: Pick<User, "googleApiRefreshToken">) {
  return user.googleApiRefreshToken !== undefined;
}

// deno-lint-ignore require-await
export async function getTokenByHash(hash: string) {
  return Object.values(Tokens).find((t) => t.hash === hash);
}

// deno-lint-ignore require-await
export async function createUserByEmail(email: string): Promise<User> {
  const user = {
    id: crypto.randomUUID(),
    email,
  };
  Users[user.id] = user;
  return user;
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
