// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import {
  HOUR,
  hourMinuteToSec,
  isValidHourMinute,
  MIN,
  secToHourMinute,
  zonedDate,
} from "./datetime.ts";
import {
  assert,
  assertEquals,
  assertFalse,
  assertThrows,
} from "std/testing/asserts.ts";

Deno.test("isValidHourMinute", () => {
  assert(isValidHourMinute("00:00"));
  assert(isValidHourMinute("09:59"));
  assert(isValidHourMinute("19:59"));
  assert(isValidHourMinute("23:59"));

  assertFalse(isValidHourMinute("00:60"));
  assertFalse(isValidHourMinute("24:00"));
});

Deno.test("hourMinuteToSec", () => {
  assertEquals(hourMinuteToSec("00:00"), 0);
  assertEquals(hourMinuteToSec("00:01"), 1 * MIN);
  assertEquals(hourMinuteToSec("00:02"), 2 * MIN);
  assertEquals(hourMinuteToSec("01:00"), 1 * HOUR);
  assertEquals(hourMinuteToSec("02:00"), 2 * HOUR);
  assertEquals(hourMinuteToSec("23:59"), 23 * HOUR + 59 * MIN);
});

Deno.test("secToHourMinute - invalid inputs", () => {
  assertThrows(() => {
    secToHourMinute(-1);
  }, RangeError);
  assertThrows(() => {
    secToHourMinute(24 * HOUR);
  }, RangeError);
});

Deno.test("secToHourMinute - valid inputs", () => {
  assertEquals(secToHourMinute(0), "00:00");
  assertEquals(secToHourMinute(1 * HOUR), "01:00");
  assertEquals(secToHourMinute(2 * HOUR), "02:00");
  assertEquals(secToHourMinute(12 * HOUR + 34 * MIN), "12:34");
  assertEquals(secToHourMinute(23 * HOUR + 59 * MIN), "23:59");
});

Deno.test("zonedDate", () => {
  // London entering DST
  assertEquals(
    zonedDate("2022-03-27T00:00Z", "Europe/London"),
    new Date("2022-03-27T00:00Z"),
  );
  assertEquals(
    zonedDate("2022-03-27T01:00Z", "Europe/London"),
    new Date("2022-03-27T01:00Z"),
  );
  assertEquals(
    zonedDate("2022-03-27T02:00Z", "Europe/London"),
    new Date("2022-03-27T01:00Z"),
  );
  assertEquals(
    zonedDate("2022-03-27T03:00Z", "Europe/London"),
    new Date("2022-03-27T02:00Z"),
  );
  // London leaving DST
  assertEquals(
    zonedDate("2022-10-29T23:00Z", "Europe/London"),
    new Date("2022-10-29T22:00Z"),
  );
  assertEquals(
    zonedDate("2022-10-30T00:00Z", "Europe/London"),
    new Date("2022-10-29T23:00Z"),
  );
  assertEquals(
    zonedDate("2022-10-30T01:00Z", "Europe/London"),
    new Date("2022-10-30T01:00Z"),
  );
  assertEquals(
    zonedDate("2022-10-30T02:00Z", "Europe/London"),
    new Date("2022-10-30T02:00Z"),
  );
  // Sydney entering DST
  assertEquals(
    zonedDate("2022-10-02T01:00Z", "Australia/Sydney"),
    new Date("2022-10-01T15:00Z"),
  );
  assertEquals(
    zonedDate("2022-10-02T02:00Z", "Australia/Sydney"),
    new Date("2022-10-01T16:00Z"),
  );
  assertEquals(
    zonedDate("2022-10-02T03:00Z", "Australia/Sydney"),
    new Date("2022-10-01T16:00Z"),
  );
  assertEquals(
    zonedDate("2022-10-02T04:00Z", "Australia/Sydney"),
    new Date("2022-10-01T17:00Z"),
  );
  // Sydney leaving DST
  assertEquals(
    zonedDate("2023-04-02T00:00Z", "Australia/Sydney"),
    new Date("2023-04-01T13:00Z"),
  );
  assertEquals(
    zonedDate("2023-04-02T01:00Z", "Australia/Sydney"),
    new Date("2023-04-01T14:00Z"),
  );
  assertEquals(
    zonedDate("2023-04-02T02:00Z", "Australia/Sydney"),
    new Date("2023-04-01T16:00Z"),
  );
  assertEquals(
    zonedDate("2023-04-02T03:00Z", "Australia/Sydney"),
    new Date("2023-04-01T17:00Z"),
  );
});
