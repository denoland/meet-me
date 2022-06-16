// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import {
  formatToYearMonthDate,
  getAvailableRangesBetween,
  HOUR,
  hourMinuteToSec,
  isValidHourMinute,
  MIN,
  secToHourMinute,
  WeekRange,
  weekRangeListToMap,
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

Deno.test("formatToYearMonthDate", () => {
  assertEquals(
    formatToYearMonthDate(new Date("2022-06-17T01:23Z")),
    "2022-06-17",
  );
});

const EXAMPLE_AVAILABILITY = [
  { weekDay: "MON", startTime: "09:00", endTime: "17:00" },
  { weekDay: "TUE", startTime: "09:00", endTime: "17:00" },
  { weekDay: "WED", startTime: "10:00", endTime: "17:00" },
  { weekDay: "THU", startTime: "09:00", endTime: "18:00" },
  { weekDay: "FRI", startTime: "09:00", endTime: "15:00" },
] as WeekRange[];

Deno.test("weekRangeListToMap", () => {
  assertEquals(
    weekRangeListToMap(EXAMPLE_AVAILABILITY),
    {
      SUN: [],
      MON: [{ weekDay: "MON", startTime: "09:00", endTime: "17:00" }],
      TUE: [{ weekDay: "TUE", startTime: "09:00", endTime: "17:00" }],
      WED: [{ weekDay: "WED", startTime: "10:00", endTime: "17:00" }],
      THU: [{ weekDay: "THU", startTime: "09:00", endTime: "18:00" }],
      FRI: [{ weekDay: "FRI", startTime: "09:00", endTime: "15:00" }],
      SAT: [],
    },
  );
});

Deno.test("getAvailableRangesBetween", () => {
  const start = new Date("2022-06-01Z");
  const end = new Date("2022-06-16Z");
  assertEquals(
    getAvailableRangesBetween(
      start,
      end,
      EXAMPLE_AVAILABILITY,
      "Europe/London",
    ),
    [
      {
        start: new Date("2022-06-01T09:00Z"),
        end: new Date("2022-06-01T16:00Z"),
      },
      {
        start: new Date("2022-06-02T08:00Z"),
        end: new Date("2022-06-02T17:00Z"),
      },
      {
        start: new Date("2022-06-03T08:00Z"),
        end: new Date("2022-06-03T14:00Z"),
      },
      {
        start: new Date("2022-06-06T08:00Z"),
        end: new Date("2022-06-06T16:00Z"),
      },
      {
        start: new Date("2022-06-07T08:00Z"),
        end: new Date("2022-06-07T16:00Z"),
      },
      {
        start: new Date("2022-06-08T09:00Z"),
        end: new Date("2022-06-08T16:00Z"),
      },
      {
        start: new Date("2022-06-09T08:00Z"),
        end: new Date("2022-06-09T17:00Z"),
      },
      {
        start: new Date("2022-06-10T08:00Z"),
        end: new Date("2022-06-10T14:00Z"),
      },
      {
        start: new Date("2022-06-13T08:00Z"),
        end: new Date("2022-06-13T16:00Z"),
      },
      {
        start: new Date("2022-06-14T08:00Z"),
        end: new Date("2022-06-14T16:00Z"),
      },
      {
        start: new Date("2022-06-15T09:00Z"),
        end: new Date("2022-06-15T16:00Z"),
      },
    ],
  );
});
