// Copyright 2022 the Deno authors. All rights reserved. MIT license.

const enc = new TextEncoder();
const dec = new TextDecoder();

type User = {
  id: string;
  email: string;
  googleApiRefreshToken: string;
  timezone: string;
  availabilities: Range[];
  events: CalendarEvent[];
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
};

// TODO(kt3k): Replace these with actual DB later.
/** id -> User */
export const Users: Record<string, User> = {};
/** hash -> Token */
export const Tokens: Record<string, Token> = {};

// deno-lint-ignore require-await
export async function getUserById(id: string) {
  return Users[id];
}

// deno-lint-ignore require-await
export async function getUserByEmail(email: string) {
  return Object.values(Users).find((u) => u.email === email);
}

// deno-lint-ignore require-await
export async function getTokenByHash(hash: string) {
  return Object.values(Tokens).find((t) => t.hash === hash);
}

export async function getUserByToken(token: string) {
  const hash = dec.decode(
    await crypto.subtle.digest("SHA-256", enc.encode(token)),
  );
  const tokenObj = await getTokenByHash(hash);
  if (tokenObj) {
    return getUserById(tokenObj.userId);
  }
}
