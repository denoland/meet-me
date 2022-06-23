// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import {
  createRangesInRange,
  getAvailableRangesBetween,
  HOUR,
  hourMinuteToSec,
  inRange,
  isValidHourMinute,
  MIN,
  rangeIsInRange,
  secToHourMinute,
  subtractRangeFromRange,
  subtractRangeListFromRange,
  subtractRangeListFromRangeList,
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

Deno.test("getAvailableRangesBetween - cut off extra part", () => {
  const start = new Date("2022-06-01T10:00Z");
  const end = new Date("2022-06-01T11:00Z");
  assertEquals(
    getAvailableRangesBetween(
      start,
      end,
      EXAMPLE_AVAILABILITY,
      "Europe/London",
    ),
    [{
      start: new Date("2022-06-01T10:00Z"),
      end: new Date("2022-06-01T11:00Z"),
    }],
  );
});

Deno.test("subtractRangeFromRange", () => {
  assertEquals(
    subtractRangeFromRange({
      start: new Date("2022-06-20T09:00Z"),
      end: new Date("2022-06-20T17:00Z"),
    }, {
      start: new Date("2022-06-20T07:00Z"),
      end: new Date("2022-06-20T08:00Z"),
    }),
    [{
      start: new Date("2022-06-20T09:00Z"),
      end: new Date("2022-06-20T17:00Z"),
    }],
  );
  assertEquals(
    subtractRangeFromRange({
      start: new Date("2022-06-20T09:00Z"),
      end: new Date("2022-06-20T17:00Z"),
    }, {
      start: new Date("2022-06-20T18:00Z"),
      end: new Date("2022-06-20T19:00Z"),
    }),
    [{
      start: new Date("2022-06-20T09:00Z"),
      end: new Date("2022-06-20T17:00Z"),
    }],
  );
  assertEquals(
    subtractRangeFromRange({
      start: new Date("2022-06-20T09:00Z"),
      end: new Date("2022-06-20T17:00Z"),
    }, {
      start: new Date("2022-06-20T08:00Z"),
      end: new Date("2022-06-20T10:00Z"),
    }),
    [{
      start: new Date("2022-06-20T10:00Z"),
      end: new Date("2022-06-20T17:00Z"),
    }],
  );
  assertEquals(
    subtractRangeFromRange({
      start: new Date("2022-06-20T09:00Z"),
      end: new Date("2022-06-20T17:00Z"),
    }, {
      start: new Date("2022-06-20T16:30Z"),
      end: new Date("2022-06-20T17:30Z"),
    }),
    [{
      start: new Date("2022-06-20T09:00Z"),
      end: new Date("2022-06-20T16:30Z"),
    }],
  );
  assertEquals(
    subtractRangeFromRange({
      start: new Date("2022-06-20T09:00Z"),
      end: new Date("2022-06-20T17:00Z"),
    }, {
      start: new Date("2022-06-20T10:30Z"),
      end: new Date("2022-06-20T11:30Z"),
    }),
    [{
      start: new Date("2022-06-20T09:00Z"),
      end: new Date("2022-06-20T10:30Z"),
    }, {
      start: new Date("2022-06-20T11:30Z"),
      end: new Date("2022-06-20T17:00Z"),
    }],
  );
});

Deno.test("subtractRangeListFromRange", () => {
  assertEquals(
    subtractRangeListFromRange({
      start: new Date("2022-06-20T09:00Z"),
      end: new Date("2022-06-20T17:00Z"),
    }, [{
      start: new Date("2022-06-20T07:00Z"),
      end: new Date("2022-06-20T08:00Z"),
    }, {
      start: new Date("2022-06-20T08:30Z"),
      end: new Date("2022-06-20T09:30Z"),
    }, {
      start: new Date("2022-06-20T10:00Z"),
      end: new Date("2022-06-20T11:00Z"),
    }, {
      start: new Date("2022-06-20T13:00Z"),
      end: new Date("2022-06-20T14:00Z"),
    }, {
      start: new Date("2022-06-20T15:30Z"),
      end: new Date("2022-06-20T17:00Z"),
    }, {
      start: new Date("2022-06-20T18:00Z"),
      end: new Date("2022-06-20T19:00Z"),
    }]),
    [{
      start: new Date("2022-06-20T09:30Z"),
      end: new Date("2022-06-20T10:00Z"),
    }, {
      start: new Date("2022-06-20T11:00Z"),
      end: new Date("2022-06-20T13:00Z"),
    }, {
      start: new Date("2022-06-20T14:00Z"),
      end: new Date("2022-06-20T15:30Z"),
    }],
  );
});

Deno.test("subtractRangeListFromRangeList", () => {
  assertEquals(
    subtractRangeListFromRangeList([{
      start: new Date("2022-06-20T09:00Z"),
      end: new Date("2022-06-20T17:00Z"),
    }, {
      start: new Date("2022-06-21T09:00Z"),
      end: new Date("2022-06-21T17:00Z"),
    }, {
      start: new Date("2022-06-22T09:00Z"),
      end: new Date("2022-06-22T17:00Z"),
    }, {
      start: new Date("2022-06-23T09:00Z"),
      end: new Date("2022-06-23T17:00Z"),
    }], [{
      start: new Date("2022-06-20T07:00Z"),
      end: new Date("2022-06-20T08:00Z"),
    }, {
      start: new Date("2022-06-20T08:30Z"),
      end: new Date("2022-06-20T09:30Z"),
    }, {
      start: new Date("2022-06-20T10:00Z"),
      end: new Date("2022-06-20T11:00Z"),
    }, {
      start: new Date("2022-06-20T13:00Z"),
      end: new Date("2022-06-20T14:00Z"),
    }, {
      start: new Date("2022-06-20T15:30Z"),
      end: new Date("2022-06-20T17:00Z"),
    }, {
      start: new Date("2022-06-20T18:00Z"),
      end: new Date("2022-06-20T19:00Z"),
    }]),
    [{
      start: new Date("2022-06-20T09:30Z"),
      end: new Date("2022-06-20T10:00Z"),
    }, {
      start: new Date("2022-06-20T11:00Z"),
      end: new Date("2022-06-20T13:00Z"),
    }, {
      start: new Date("2022-06-20T14:00Z"),
      end: new Date("2022-06-20T15:30Z"),
    }, {
      start: new Date("2022-06-21T09:00Z"),
      end: new Date("2022-06-21T17:00Z"),
    }, {
      start: new Date("2022-06-22T09:00Z"),
      end: new Date("2022-06-22T17:00Z"),
    }, {
      start: new Date("2022-06-23T09:00Z"),
      end: new Date("2022-06-23T17:00Z"),
    }],
  );
});

Deno.test("inRange", () => {
  assert(
    !inRange(new Date("2022-04Z"), new Date("2022-05Z"), new Date("2022-07Z")),
  );
  assert(
    inRange(new Date("2022-05Z"), new Date("2022-05Z"), new Date("2022-07Z")),
  );
  assert(
    inRange(new Date("2022-06Z"), new Date("2022-05Z"), new Date("2022-07Z")),
  );
  assert(
    inRange(new Date("2022-07Z"), new Date("2022-05Z"), new Date("2022-07Z")),
  );
  assert(
    !inRange(new Date("2022-08Z"), new Date("2022-05Z"), new Date("2022-07Z")),
  );
});

Deno.test("rangeIsInRange", () => {
  assert(
    !rangeIsInRange(
      { start: new Date("2017Z"), end: new Date("2019Z") },
      { start: new Date("2020Z"), end: new Date("2024Z") },
    ),
  );
  assert(
    !rangeIsInRange(
      { start: new Date("2018Z"), end: new Date("2020Z") },
      { start: new Date("2020Z"), end: new Date("2024Z") },
    ),
  );
  assert(
    !rangeIsInRange(
      { start: new Date("2019Z"), end: new Date("2021Z") },
      { start: new Date("2020Z"), end: new Date("2024Z") },
    ),
  );
  assert(
    rangeIsInRange(
      { start: new Date("2020Z"), end: new Date("2022Z") },
      { start: new Date("2020Z"), end: new Date("2024Z") },
    ),
  );
  assert(
    rangeIsInRange(
      { start: new Date("2021Z"), end: new Date("2023Z") },
      { start: new Date("2020Z"), end: new Date("2024Z") },
    ),
  );
  assert(
    rangeIsInRange(
      { start: new Date("2022Z"), end: new Date("2024Z") },
      { start: new Date("2020Z"), end: new Date("2024Z") },
    ),
  );
  assert(
    !rangeIsInRange(
      { start: new Date("2023Z"), end: new Date("2025Z") },
      { start: new Date("2020Z"), end: new Date("2024Z") },
    ),
  );
  assert(
    !rangeIsInRange(
      { start: new Date("2024Z"), end: new Date("2026Z") },
      { start: new Date("2020Z"), end: new Date("2024Z") },
    ),
  );
  assert(
    !rangeIsInRange(
      { start: new Date("2025Z"), end: new Date("2027Z") },
      { start: new Date("2020Z"), end: new Date("2024Z") },
    ),
  );
});

Deno.test("createRangesInRange", () => {
  assertEquals(
    createRangesInRange(
      new Date("2022-06-22T00:00Z"),
      new Date("2022-06-22T02:00Z"),
      30 * MIN,
      30 * MIN,
    ),
    [
      {
        start: new Date("2022-06-22T00:00Z"),
        end: new Date("2022-06-22T00:30Z"),
      },
      {
        start: new Date("2022-06-22T00:30Z"),
        end: new Date("2022-06-22T01:00Z"),
      },
      {
        start: new Date("2022-06-22T01:00Z"),
        end: new Date("2022-06-22T01:30Z"),
      },
      {
        start: new Date("2022-06-22T01:30Z"),
        end: new Date("2022-06-22T02:00Z"),
      },
    ],
  );
});
