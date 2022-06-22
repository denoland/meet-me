// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

export const TOKEN_ENDPOINT = Deno.env.get("TOKEN_ENDPOINT") ??
  "https://oauth2.googleapis.com/token";
export const CALENDAR_FREE_BUSY_API = Deno.env.get("CALENDAR_FREE_BUSY_API") ??
  "https://www.googleapis.com/calendar/v3/freeBusy";
export const CALENDAR_EVENTS_API = Deno.env.get("CALENDAR_EVENTS_API") ??
  "https://www.googleapis.com/calendar/v3/calendars/:calendarId/events";
