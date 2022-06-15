// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import { useState } from "react";
import {
  HOUR,
  hourMinuteToSec,
  MIN,
  secToHourMinute,
  WeekDay,
} from "utils/datetime.ts";
import { WeekRange } from "utils/db.ts";
import cx from "utils/cx.ts";
import Button from "base/Button.tsx";
import Input from "base/Input.tsx";
import icons from "icons";

type RangeMap = Record<WeekDay, WeekRange[]>;

function rangesToRangeMap(ranges: WeekRange[]): RangeMap {
  return {
    SUN: ranges.filter((range) => range.weekDay === "SUN"),
    MON: ranges.filter((range) => range.weekDay === "MON"),
    TUE: ranges.filter((range) => range.weekDay === "TUE"),
    WED: ranges.filter((range) => range.weekDay === "WED"),
    THU: ranges.filter((range) => range.weekDay === "THU"),
    FRI: ranges.filter((range) => range.weekDay === "FRI"),
    SAT: ranges.filter((range) => range.weekDay === "SAT"),
  };
}

type Props = {
  availabilities: WeekRange[];
  onChange: (ranges: WeekRange[]) => void;
};

export default function AvailabilitySettings(
  { availabilities, onChange }: Props,
) {
  const rangeMap = rangesToRangeMap(availabilities);
  return (
    <ul>
      {Object.entries(rangeMap).map(([weekDay, ranges]) => (
        <WeekRow
          key={weekDay}
          weekDay={weekDay as WeekDay}
          ranges={ranges}
          onRangeUpdate={(r) => {
            const newAvailabilities = Object.values<WeekRange[]>({
              ...rangeMap,
              [weekDay]: r,
            }).flat();
            onChange(newAvailabilities);
          }}
        />
      ))}
    </ul>
  );
}

function WeekRow(
  { weekDay, ranges, onRangeUpdate }: {
    weekDay: WeekDay;
    ranges: WeekRange[];
    onRangeUpdate: (ranges: WeekRange[]) => void;
  },
) {
  const noRanges = ranges.length === 0;

  const onChange = (v: string, type: "startTime" | "endTime", i: number) => {
    const result = [...ranges];
    result[i] = { ...ranges[i], [type]: v };
    onRangeUpdate(result);
  };

  const onRemove = (i: number) => {
    const result = [...ranges];
    result.splice(i, 1);
    onRangeUpdate(result);
  };

  const onPlus = () => {
    const lastRange = ranges.at(-1);
    if (!lastRange) {
      onRangeUpdate([{ weekDay, startTime: "09:00", endTime: "17:00" }]);
      return;
    }
    const lastEndTime = hourMinuteToSec(lastRange.endTime)!;
    const newStartTime = Math.min(lastEndTime + HOUR, 24 * HOUR - 15 * MIN);
    const newEndTime = Math.min(newStartTime + HOUR, 24 * HOUR - 15 * MIN);
    const newRange = {
      weekDay,
      startTime: secToHourMinute(newStartTime),
      endTime: secToHourMinute(newEndTime),
    };
    const result = [...ranges, newRange];
    onRangeUpdate(result);
  };

  return (
    <div
      className={cx(
        "flex justify-between px-4 py-2 border-b border-neutral-700",
      )}
    >
      {noRanges && (
        <>
          <div className="flex items-center gap-4">
            <span className="w-10">{weekDay}</span>
            <span className="text-neutral-600">Unavailable</span>
          </div>
          <div>
            <Button style="outline" size="xs" onClick={onPlus}>
              <icons.Plus size={11} />
            </Button>
          </div>
        </>
      )}
      {!noRanges && (
        <div className="flex flex-col w-full gap-3">
          {ranges.map(({ startTime, endTime }, i) => (
            <div className="flex items-center justify-between" key={i}>
              <div className="flex items-center gap-2">
                <span className="w-10">{i === 0 && weekDay}</span>
                <Input
                  className="w-24 text-center"
                  value={startTime}
                  onChange={(v) =>
                    onChange(v, "startTime", i)}
                />
                ~
                <Input
                  className="w-24"
                  value={endTime}
                  onChange={(v) =>
                    onChange(v, "endTime", i)}
                />
                <Button size="xs" style="none" onClick={() => onRemove(i)}>
                  <icons.TrashBin />
                </Button>
              </div>
              <div>
                {i === 0 && (
                  <Button style="outline" size="xs" onClick={onPlus}>
                    <icons.Plus size={11} />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
