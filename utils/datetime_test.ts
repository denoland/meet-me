// Copyright 2022 the Deno authors. All rights reserved. MIT license.
import {
  HOUR,
  hourMinuteToSec,
  isValidHourMinute,
  MIN,
  secToHourMinute,
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
