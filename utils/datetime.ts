// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import { tzOffset } from "https://raw.githubusercontent.com/Tak-Iwamoto/ptera/ec29b7cfa3038b1cea07b9d0d1e69c39ee472d6d/timezone.ts";

export const SEC = 1000;
export const MIN = 60 * SEC;
export const HOUR = 60 * MIN;
export const DAY = 24 * HOUR;

export type TimeZone = (typeof timeZones)[number];

export function isValidTimeZone(
  timeZone: string,
): timeZone is TimeZone {
  // deno-lint-ignore no-explicit-any
  return timeZones.includes(timeZone as any);
}

const RE_HOUR_MINUTE = /([01][0-9]|2[0-3]):([0-5][0-9])/;
export function isValidHourMinute(hourMinute: string) {
  return RE_HOUR_MINUTE.test(hourMinute);
}

export function hourMinuteToSec(hourMinute: string): number | undefined {
  const match = hourMinute.match(RE_HOUR_MINUTE);
  if (!match) {
    return;
  }
  const [, h, m] = match;
  return +h * HOUR + +m * MIN;
}

export function secToHourMinute(sec: number): string {
  if (sec >= 24 * HOUR || sec < 0) {
    throw new RangeError(
      `The given sec is out of the range between 0 <= sec < 24`,
    );
  }
  const h = Math.floor(sec / HOUR);
  const m = Math.floor((sec % HOUR) / MIN);
  return h.toString().padStart(2, "0") + ":" + m.toString().padStart(2, "0");
}

const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;
export type WeekDay = (typeof weekDays)[number];

export function isValidWeekDay(day: unknown): day is WeekDay {
  // deno-lint-ignore no-explicit-any
  return weekDays.includes(day as any);
}

/** Returns a date of the given date string in the given time zone.
 * The given date needs to be in form of "YYYY-MM-DDTHH:mm:ssZ"
 *
 * If you want to get the date of 2022/10/02 1am in Australia/Sydney
 * Then call this like:
 *
 * ```ts
 * const d = zonedDate("2022-10-02T01:00Z", "Australia/Sydney");
 * ```
 */
export function zonedDate(date: string, timeZone: TimeZone): Date {
  const d = new Date(date);
  // First get an offset from the given date and timeZone.
  // This can be wrong 1 hour when d is close to daylight saving time
  // boundary.
  const offset = tzOffset(d, timeZone);
  // We get an offset again with the adjusted date object.
  // This is better approximation than the above.
  const betterOffset = tzOffset(new Date(+d - offset), timeZone);
  return new Date(+d - betterOffset);
}

/** WeekRange represents an available range in a week. */
export type WeekRange = {
  weekDay: WeekDay;
  startTime: string; // "HH:mm" format
  endTime: string; // "HH:mm" format
};

export type WeekRangeMap = Record<WeekDay, WeekRange[]>;

export type Range = {
  start: Date;
  end: Date;
};

export function weekRangeListToMap(ranges: WeekRange[]): WeekRangeMap {
  return {
    SUN: ranges.filter((r) => r.weekDay === "SUN"),
    MON: ranges.filter((r) => r.weekDay === "MON"),
    TUE: ranges.filter((r) => r.weekDay === "TUE"),
    WED: ranges.filter((r) => r.weekDay === "WED"),
    THU: ranges.filter((r) => r.weekDay === "THU"),
    FRI: ranges.filter((r) => r.weekDay === "FRI"),
    SAT: ranges.filter((r) => r.weekDay === "SAT"),
  };
}

function numberToWeekDay(num: number): WeekDay {
  switch (num) {
    case 0:
      return "SUN";
    case 1:
      return "MON";
    case 2:
      return "TUE";
    case 3:
      return "WED";
    case 4:
      return "THU";
    case 5:
      return "FRI";
    case 6:
      return "SAT";
    default:
      throw new Error(`Invalid number for week day: ${num}`);
  }
}

/** Converts the given WeekRange to a Range with given date and time zone.
 * date needs to be in the form of YYYY-MM-DD. */
function weekRangeToRange(
  date: string,
  weekRange: WeekRange,
  timeZone: TimeZone,
): Range {
  return {
    start: zonedDate(date + "T" + weekRange.startTime + "Z", timeZone),
    end: zonedDate(date + "T" + weekRange.endTime + "Z", timeZone),
  };
}

/** Returns true if the given date is between the given start date
 * and end date. */
export function inRange(date: Date, start: Date, end: Date): boolean {
  const s = +start;
  const e = +end;
  const d = +date;
  return s <= d && d <= e;
}

/** Returns true when the 1st given range is contained in the 2nd given range. */
export function rangeIsInRange(x: Range, y: Range): boolean {
  const xs = +x.start;
  const xe = +x.end;
  const ys = +y.start;
  const ye = +y.end;
  return ys <= xs && xe <= ye;
}

/** Creates a list of ranges of the give duration between the given
 * start date and end date with given step length. */
export function createRangesInRange(
  start: Date,
  end: Date,
  duration: number,
  step: number,
): Range[] {
  const s = +start;
  const e = +end;
  let offset = 0;
  const result = [];
  while (s + offset + duration <= e) {
    result.push({
      start: new Date(s + offset),
      end: new Date(s + offset + duration),
    });
    offset += step;
  }
  return result;
}

export function filterAvailableRange(
  ranges: Range[],
  availability: Range[],
): Range[] {
  return ranges.filter((range) =>
    availability.some((availableRange) => rangeIsInRange(range, availableRange))
  );
}

/** Formats the date in YYYY-MM-DD format in UTC timezone */
export function formatToYearMonthDateUTC(d: Date) {
  return d.toISOString().slice(0, 10);
}

/** Formats the date in YYYY-MM-DD format in local timezone */
export function formatToYearMonthDateLocal(date: Date) {
  const y = date.getFullYear();
  let m = "" + (date.getMonth() + 1);
  if (m.length === 1) {
    m = "0" + m;
  }
  let d = "" + date.getDate();
  if (d.length === 1) {
    d = "0" + d;
  }
  return `${y}-${m}-${d}`;
}

/** YYYY-MM-DD to Date object in local time zone */
export function yearMonthDateToLocalDate(d: string): Date {
  const [year, month, date] = d.split("-");
  return new Date(+year, +month - 1, +date);
}

export function startOfMonth(d: Date, n = 0) {
  return new Date(d.getFullYear(), d.getMonth() + n);
}

export function endOfMonth(d: Date, n = 0) {
  return new Date(+new Date(d.getFullYear(), d.getMonth() + 1 + n) - DAY);
}

export function daysOfMonth(d: Date) {
  return (+endOfMonth(d) - +startOfMonth(d)) / DAY + 1;
}

export function getAvailableRangesBetween(
  start: Date,
  end: Date,
  availabilities: WeekRange[],
  timeZone: TimeZone,
): Range[] {
  const map = weekRangeListToMap(availabilities);
  let d = new Date(+start - 2 * DAY);
  const endWithMargin = new Date(+end + 2 * DAY);
  const result = [];
  while (d < endWithMargin) {
    const date = formatToYearMonthDateUTC(d);
    const weekRanges = map[numberToWeekDay(d.getUTCDay())];
    for (const wr of weekRanges) {
      const r = weekRangeToRange(date, wr, timeZone);
      if (r.end > start && r.start < end) {
        if (end < r.end) {
          r.end = end;
        }
        if (r.start < start) {
          r.start = start;
        }
        result.push(r);
      }
    }
    d = new Date(+d + DAY);
  }

  return result;
}

/**
 * Subtract (take difference) the range list from the other range list.
 * Note: used for calculating diff of user set availability and already
 * occupied slots. The result returns the actual available slots of the user.
 *
 * TODO(kt3k): We can optimize this method if we group the source list and
 * subtract list by, for example, date (YYYY-MM-DD).
 * @param sources
 * @param subtractList
 * @returns
 */
export function subtractRangeListFromRangeList(
  sourceList: Range[],
  subtractList: Range[],
): Range[] {
  const result = [];
  for (const source of sourceList) {
    // We assume sources are disjoint
    result.push(...subtractRangeListFromRange(source, subtractList));
  }
  return result;
}

export function subtractRangeListFromRange(
  source: Range,
  subtractList: Range[],
): Range[] {
  subtractList = [...subtractList];
  while (subtractList.length > 0) {
    const subtract = subtractList.pop();
    const res = subtractRangeFromRange(source, subtract!);
    if (res.length === 0) {
      return [];
    }
    if (res.length === 1) {
      source = res[0];
    }
    if (res.length === 2) {
      const remains = [...subtractList];
      const leftResult = subtractRangeListFromRange(res[0], remains);
      const rightResult = subtractRangeListFromRange(res[1], remains);
      return leftResult.concat(rightResult);
    }
  }
  return [source];
}

/** Returns true if the given range is longer than the given duration.
 * Higher order function, used for filtering the range list. */
export function rangeIsLonger(duration: number) {
  return (range: Range) => +range.end - +range.start >= duration;
}

/** Converts the given data transfer object (parsed json) to Range */
export function rangeFromObj(obj: { start: string; end: string }) {
  return {
    start: new Date(obj.start),
    end: new Date(obj.end),
  };
}

export type DateRangeMap = Record<string, Range[]>;

/** Returns a date-to-ranges map from the given list of ranges. */
export function rangeListToLocalDateRangeMap(ranges: Range[]): DateRangeMap {
  const map: DateRangeMap = {};
  if (!ranges) {
    return map;
  }
  for (const r of ranges) {
    const ymdStart = formatToYearMonthDateLocal(r.start);
    const ranges = map[ymdStart] ??= [];
    ranges.push(r);
    const ymdEnd = formatToYearMonthDateLocal(r.end);
    if (ymdEnd !== ymdEnd) {
      // Here we suppose every range has less than 24 hour duration.
      // So it's enough to check start date and end date.
      const ranges = map[ymdEnd] ??= [];
      ranges.push(r);
    }
  }
  return map;
}

export function subtractRangeFromRange(
  source: Range,
  subtract: Range,
): Range[] {
  if (subtract.end <= source.start) {
    // subtract is too early and no intersection
    return [{ ...source }];
  } else if (source.end <= subtract.start) {
    // subtract is too late and no intersection
    return [{ ...source }];
  } else if (subtract.start <= source.start && source.end <= subtract.end) {
    // subtract covers the entire source
    return [];
  } else if (subtract.start <= source.start && subtract.end < source.end) {
    // subtract covers the first part of source
    return [{ start: subtract.end, end: source.end }];
  } else if (source.start < subtract.start && source.end <= subtract.end) {
    // subtract covers the last part of source
    return [{ start: source.start, end: subtract.start }];
  } else if (source.start < subtract.start && subtract.end < source.end) {
    // subtract is contained in source, so the source is split into two parts
    return [{ start: source.start, end: subtract.start }, {
      start: subtract.end,
      end: source.end,
    }];
  }
  console.log(source, subtract);
  throw new Error("unreachable");
}

/** This array includes the all strings in the form of
 * 00:00, 00:30, 01:00, ..., 23:30 */
export const SELECTABLE_MINUTES = [...Array(24)].map((_, hour) => {
  let h = "" + hour;
  if (h.length === 1) {
    h = "0" + h;
  }
  return [h + ":00", h + ":30"];
}).flat();

export const timeZones = [
  "Africa/Abidjan",
  "Africa/Accra",
  "Africa/Addis_Ababa",
  "Africa/Algiers",
  "Africa/Asmara",
  "Africa/Asmera",
  "Africa/Bamako",
  "Africa/Bangui",
  "Africa/Banjul",
  "Africa/Bissau",
  "Africa/Blantyre",
  "Africa/Brazzaville",
  "Africa/Bujumbura",
  "Africa/Cairo",
  "Africa/Casablanca",
  "Africa/Ceuta",
  "Africa/Conakry",
  "Africa/Dakar",
  "Africa/Dar_es_Salaam",
  "Africa/Djibouti",
  "Africa/Douala",
  "Africa/El_Aaiun",
  "Africa/Freetown",
  "Africa/Gaborone",
  "Africa/Harare",
  "Africa/Johannesburg",
  "Africa/Juba",
  "Africa/Kampala",
  "Africa/Khartoum",
  "Africa/Kigali",
  "Africa/Kinshasa",
  "Africa/Lagos",
  "Africa/Libreville",
  "Africa/Lome",
  "Africa/Luanda",
  "Africa/Lubumbashi",
  "Africa/Lusaka",
  "Africa/Malabo",
  "Africa/Maputo",
  "Africa/Maseru",
  "Africa/Mbabane",
  "Africa/Mogadishu",
  "Africa/Monrovia",
  "Africa/Nairobi",
  "Africa/Ndjamena",
  "Africa/Niamey",
  "Africa/Nouakchott",
  "Africa/Ouagadougou",
  "Africa/Porto-Novo",
  "Africa/Sao_Tome",
  "Africa/Timbuktu",
  "Africa/Tripoli",
  "Africa/Tunis",
  "Africa/Windhoek",
  "America/Adak",
  "America/Anchorage",
  "America/Anguilla",
  "America/Antigua",
  "America/Araguaina",
  "America/Argentina/Buenos_Aires",
  "America/Argentina/Catamarca",
  "America/Argentina/ComodRivadavia",
  "America/Argentina/Cordoba",
  "America/Argentina/Jujuy",
  "America/Argentina/La_Rioja",
  "America/Argentina/Mendoza",
  "America/Argentina/Rio_Gallegos",
  "America/Argentina/Salta",
  "America/Argentina/San_Juan",
  "America/Argentina/San_Luis",
  "America/Argentina/Tucuman",
  "America/Argentina/Ushuaia",
  "America/Aruba",
  "America/Asuncion",
  "America/Atikokan",
  "America/Atka",
  "America/Bahia_Banderas",
  "America/Bahia",
  "America/Barbados",
  "America/Belem",
  "America/Belize",
  "America/Blanc-Sablon",
  "America/Boa_Vista",
  "America/Bogota",
  "America/Boise",
  "America/Buenos_Aires",
  "America/Cambridge_Bay",
  "America/Campo_Grande",
  "America/Cancun",
  "America/Caracas",
  "America/Catamarca",
  "America/Cayenne",
  "America/Cayman",
  "America/Chicago",
  "America/Chihuahua",
  "America/Coral_Harbour",
  "America/Cordoba",
  "America/Costa_Rica",
  "America/Creston",
  "America/Cuiaba",
  "America/Curacao",
  "America/Danmarkshavn",
  "America/Dawson_Creek",
  "America/Dawson",
  "America/Denver",
  "America/Detroit",
  "America/Dominica",
  "America/Edmonton",
  "America/Eirunepe",
  "America/El_Salvador",
  "America/Ensenada",
  "America/Fort_Nelson",
  "America/Fort_Wayne",
  "America/Fortaleza",
  "America/Glace_Bay",
  "America/Godthab",
  "America/Goose_Bay",
  "America/Grand_Turk",
  "America/Grenada",
  "America/Guadeloupe",
  "America/Guatemala",
  "America/Guayaquil",
  "America/Guyana",
  "America/Halifax",
  "America/Havana",
  "America/Hermosillo",
  "America/Indiana/Indianapolis",
  "America/Indiana/Knox",
  "America/Indiana/Marengo",
  "America/Indiana/Petersburg",
  "America/Indiana/Tell_City",
  "America/Indiana/Vevay",
  "America/Indiana/Vincennes",
  "America/Indiana/Winamac",
  "America/Indianapolis",
  "America/Inuvik",
  "America/Iqaluit",
  "America/Jamaica",
  "America/Jujuy",
  "America/Juneau",
  "America/Kentucky/Louisville",
  "America/Kentucky/Monticello",
  "America/Knox_IN",
  "America/Kralendijk",
  "America/La_Paz",
  "America/Lima",
  "America/Los_Angeles",
  "America/Louisville",
  "America/Lower_Princes",
  "America/Maceio",
  "America/Managua",
  "America/Manaus",
  "America/Marigot",
  "America/Martinique",
  "America/Matamoros",
  "America/Mazatlan",
  "America/Mendoza",
  "America/Menominee",
  "America/Merida",
  "America/Metlakatla",
  "America/Mexico_City",
  "America/Miquelon",
  "America/Moncton",
  "America/Monterrey",
  "America/Montevideo",
  "America/Montreal",
  "America/Montserrat",
  "America/Nassau",
  "America/New_York",
  "America/Nipigon",
  "America/Nome",
  "America/Noronha",
  "America/North_Dakota/Beulah",
  "America/North_Dakota/Center",
  "America/North_Dakota/New_Salem",
  "America/Nuuk",
  "America/Ojinaga",
  "America/Panama",
  "America/Pangnirtung",
  "America/Paramaribo",
  "America/Phoenix",
  "America/Port_of_Spain",
  "America/Port-au-Prince",
  "America/Porto_Acre",
  "America/Porto_Velho",
  "America/Puerto_Rico",
  "America/Punta_Arenas",
  "America/Rainy_River",
  "America/Rankin_Inlet",
  "America/Recife",
  "America/Regina",
  "America/Resolute",
  "America/Rio_Branco",
  "America/Rosario",
  "America/Santa_Isabel",
  "America/Santarem",
  "America/Santiago",
  "America/Santo_Domingo",
  "America/Sao_Paulo",
  "America/Scoresbysund",
  "America/Shiprock",
  "America/Sitka",
  "America/St_Barthelemy",
  "America/St_Johns",
  "America/St_Kitts",
  "America/St_Lucia",
  "America/St_Thomas",
  "America/St_Vincent",
  "America/Swift_Current",
  "America/Tegucigalpa",
  "America/Thule",
  "America/Thunder_Bay",
  "America/Tijuana",
  "America/Toronto",
  "America/Tortola",
  "America/Vancouver",
  "America/Virgin",
  "America/Whitehorse",
  "America/Winnipeg",
  "America/Yakutat",
  "America/Yellowknife",
  "Antarctica/Casey",
  "Antarctica/Davis",
  "Antarctica/DumontDUrville",
  "Antarctica/Macquarie",
  "Antarctica/Mawson",
  "Antarctica/McMurdo",
  "Antarctica/Palmer",
  "Antarctica/Rothera",
  "Antarctica/South_Pole",
  "Antarctica/Syowa",
  "Antarctica/Troll",
  "Antarctica/Vostok",
  "Arctic/Longyearbyen",
  "Asia/Aden",
  "Asia/Almaty",
  "Asia/Amman",
  "Asia/Anadyr",
  "Asia/Aqtau",
  "Asia/Aqtobe",
  "Asia/Ashgabat",
  "Asia/Ashkhabad",
  "Asia/Atyrau",
  "Asia/Baghdad",
  "Asia/Bahrain",
  "Asia/Baku",
  "Asia/Bangkok",
  "Asia/Barnaul",
  "Asia/Beirut",
  "Asia/Bishkek",
  "Asia/Brunei",
  "Asia/Calcutta",
  "Asia/Chita",
  "Asia/Choibalsan",
  "Asia/Chongqing",
  "Asia/Chungking",
  "Asia/Colombo",
  "Asia/Dacca",
  "Asia/Damascus",
  "Asia/Dhaka",
  "Asia/Dili",
  "Asia/Dubai",
  "Asia/Dushanbe",
  "Asia/Famagusta",
  "Asia/Gaza",
  "Asia/Harbin",
  "Asia/Hebron",
  "Asia/Ho_Chi_Minh",
  "Asia/Hong_Kong",
  "Asia/Hovd",
  "Asia/Irkutsk",
  "Asia/Istanbul",
  "Asia/Jakarta",
  "Asia/Jayapura",
  "Asia/Jerusalem",
  "Asia/Kabul",
  "Asia/Kamchatka",
  "Asia/Karachi",
  "Asia/Kashgar",
  "Asia/Kathmandu",
  "Asia/Katmandu",
  "Asia/Khandyga",
  "Asia/Kolkata",
  "Asia/Krasnoyarsk",
  "Asia/Kuala_Lumpur",
  "Asia/Kuching",
  "Asia/Kuwait",
  "Asia/Macao",
  "Asia/Macau",
  "Asia/Magadan",
  "Asia/Makassar",
  "Asia/Manila",
  "Asia/Muscat",
  "Asia/Nicosia",
  "Asia/Novokuznetsk",
  "Asia/Novosibirsk",
  "Asia/Omsk",
  "Asia/Oral",
  "Asia/Phnom_Penh",
  "Asia/Pontianak",
  "Asia/Pyongyang",
  "Asia/Qatar",
  "Asia/Qostanay",
  "Asia/Qyzylorda",
  "Asia/Rangoon",
  "Asia/Riyadh",
  "Asia/Saigon",
  "Asia/Sakhalin",
  "Asia/Samarkand",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Asia/Srednekolymsk",
  "Asia/Taipei",
  "Asia/Tashkent",
  "Asia/Tbilisi",
  "Asia/Tehran",
  "Asia/Tel_Aviv",
  "Asia/Thimbu",
  "Asia/Thimphu",
  "Asia/Tokyo",
  "Asia/Tomsk",
  "Asia/Ujung_Pandang",
  "Asia/Ulaanbaatar",
  "Asia/Ulan_Bator",
  "Asia/Urumqi",
  "Asia/Ust-Nera",
  "Asia/Vientiane",
  "Asia/Vladivostok",
  "Asia/Yakutsk",
  "Asia/Yangon",
  "Asia/Yekaterinburg",
  "Asia/Yerevan",
  "Atlantic/Azores",
  "Atlantic/Bermuda",
  "Atlantic/Canary",
  "Atlantic/Cape_Verde",
  "Atlantic/Faeroe",
  "Atlantic/Faroe",
  "Atlantic/Jan_Mayen",
  "Atlantic/Madeira",
  "Atlantic/Reykjavik",
  "Atlantic/South_Georgia",
  "Atlantic/St_Helena",
  "Atlantic/Stanley",
  "Australia/ACT",
  "Australia/Adelaide",
  "Australia/Brisbane",
  "Australia/Broken_Hill",
  "Australia/Canberra",
  "Australia/Currie",
  "Australia/Darwin",
  "Australia/Eucla",
  "Australia/Hobart",
  "Australia/LHI",
  "Australia/Lindeman",
  "Australia/Lord_Howe",
  "Australia/Melbourne",
  "Australia/North",
  "Australia/NSW",
  "Australia/Perth",
  "Australia/Queensland",
  "Australia/South",
  "Australia/Sydney",
  "Australia/Tasmania",
  "Australia/Victoria",
  "Australia/West",
  "Australia/Yancowinna",
  "Brazil/Acre",
  "Brazil/DeNoronha",
  "Brazil/East",
  "Brazil/West",
  "Canada/Atlantic",
  "Canada/Central",
  "Canada/Eastern",
  "Canada/Mountain",
  "Canada/Newfoundland",
  "Canada/Pacific",
  "Canada/Saskatchewan",
  "Canada/Yukon",
  "CET",
  "Chile/Continental",
  "Chile/EasterIsland",
  "CST6CDT",
  "Cuba",
  "EET",
  "Egypt",
  "Eire",
  "EST",
  "EST5EDT",
  "Etc/GMT-0",
  "Etc/GMT-1",
  "Etc/GMT-10",
  "Etc/GMT-11",
  "Etc/GMT-12",
  "Etc/GMT-13",
  "Etc/GMT-14",
  "Etc/GMT-2",
  "Etc/GMT-3",
  "Etc/GMT-4",
  "Etc/GMT-5",
  "Etc/GMT-6",
  "Etc/GMT-7",
  "Etc/GMT-8",
  "Etc/GMT-9",
  "Etc/GMT",
  "Etc/GMT+0",
  "Etc/GMT+1",
  "Etc/GMT+10",
  "Etc/GMT+11",
  "Etc/GMT+12",
  "Etc/GMT+2",
  "Etc/GMT+3",
  "Etc/GMT+4",
  "Etc/GMT+5",
  "Etc/GMT+6",
  "Etc/GMT+7",
  "Etc/GMT+8",
  "Etc/GMT+9",
  "Etc/GMT0",
  "Etc/Greenwich",
  "Etc/UCT",
  "Etc/Universal",
  "Etc/UTC",
  "Etc/Zulu",
  "Europe/Amsterdam",
  "Europe/Andorra",
  "Europe/Astrakhan",
  "Europe/Athens",
  "Europe/Belfast",
  "Europe/Belgrade",
  "Europe/Berlin",
  "Europe/Bratislava",
  "Europe/Brussels",
  "Europe/Bucharest",
  "Europe/Budapest",
  "Europe/Busingen",
  "Europe/Chisinau",
  "Europe/Copenhagen",
  "Europe/Dublin",
  "Europe/Gibraltar",
  "Europe/Guernsey",
  "Europe/Helsinki",
  "Europe/Isle_of_Man",
  "Europe/Istanbul",
  "Europe/Jersey",
  "Europe/Kaliningrad",
  "Europe/Kiev",
  "Europe/Kirov",
  "Europe/Lisbon",
  "Europe/Ljubljana",
  "Europe/London",
  "Europe/Luxembourg",
  "Europe/Madrid",
  "Europe/Malta",
  "Europe/Mariehamn",
  "Europe/Minsk",
  "Europe/Monaco",
  "Europe/Moscow",
  "Europe/Nicosia",
  "Europe/Oslo",
  "Europe/Paris",
  "Europe/Podgorica",
  "Europe/Prague",
  "Europe/Riga",
  "Europe/Rome",
  "Europe/Samara",
  "Europe/San_Marino",
  "Europe/Sarajevo",
  "Europe/Saratov",
  "Europe/Simferopol",
  "Europe/Skopje",
  "Europe/Sofia",
  "Europe/Stockholm",
  "Europe/Tallinn",
  "Europe/Tirane",
  "Europe/Tiraspol",
  "Europe/Ulyanovsk",
  "Europe/Uzhgorod",
  "Europe/Vaduz",
  "Europe/Vatican",
  "Europe/Vienna",
  "Europe/Vilnius",
  "Europe/Volgograd",
  "Europe/Warsaw",
  "Europe/Zagreb",
  "Europe/Zaporozhye",
  "Europe/Zurich",
  "Factory",
  "GB-Eire",
  "GB",
  "GMT-0",
  "GMT",
  "GMT+0",
  "GMT0",
  "Greenwich",
  "Hongkong",
  "HST",
  "Iceland",
  "Indian/Antananarivo",
  "Indian/Chagos",
  "Indian/Christmas",
  "Indian/Cocos",
  "Indian/Comoro",
  "Indian/Kerguelen",
  "Indian/Mahe",
  "Indian/Maldives",
  "Indian/Mauritius",
  "Indian/Mayotte",
  "Indian/Reunion",
  "Iran",
  "Israel",
  "Jamaica",
  "Japan",
  "Kwajalein",
  "Libya",
  "MET",
  "Mexico/BajaNorte",
  "Mexico/BajaSur",
  "Mexico/General",
  "MST",
  "MST7MDT",
  "Navajo",
  "NZ-CHAT",
  "NZ",
  "Pacific/Apia",
  "Pacific/Auckland",
  "Pacific/Bougainville",
  "Pacific/Chatham",
  "Pacific/Chuuk",
  "Pacific/Easter",
  "Pacific/Efate",
  "Pacific/Enderbury",
  "Pacific/Fakaofo",
  "Pacific/Fiji",
  "Pacific/Funafuti",
  "Pacific/Galapagos",
  "Pacific/Gambier",
  "Pacific/Guadalcanal",
  "Pacific/Guam",
  "Pacific/Honolulu",
  "Pacific/Johnston",
  "Pacific/Kanton",
  "Pacific/Kiritimati",
  "Pacific/Kosrae",
  "Pacific/Kwajalein",
  "Pacific/Majuro",
  "Pacific/Marquesas",
  "Pacific/Midway",
  "Pacific/Nauru",
  "Pacific/Niue",
  "Pacific/Norfolk",
  "Pacific/Noumea",
  "Pacific/Pago_Pago",
  "Pacific/Palau",
  "Pacific/Pitcairn",
  "Pacific/Pohnpei",
  "Pacific/Ponape",
  "Pacific/Port_Moresby",
  "Pacific/Rarotonga",
  "Pacific/Saipan",
  "Pacific/Samoa",
  "Pacific/Tahiti",
  "Pacific/Tarawa",
  "Pacific/Tongatapu",
  "Pacific/Truk",
  "Pacific/Wake",
  "Pacific/Wallis",
  "Pacific/Yap",
  "Poland",
  "Portugal",
  "PRC",
  "PST8PDT",
  "ROC",
  "ROK",
  "Singapore",
  "Turkey",
  "UCT",
  "Universal",
  "US/Alaska",
  "US/Aleutian",
  "US/Arizona",
  "US/Central",
  "US/East-Indiana",
  "US/Eastern",
  "US/Hawaii",
  "US/Indiana-Starke",
  "US/Michigan",
  "US/Mountain",
  "US/Pacific",
  "US/Samoa",
  "UTC",
  "W-SU",
  "WET",
  "Zulu",
] as const;
