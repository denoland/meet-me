// Copyright 2022 the Deno authors. All rights reserved. MIT license.
/** @jsxImportSource https://esm.sh/react@18.2.0 */

import {
  HOUR,
  hourMinuteToSec,
  MIN,
  secToHourMinute,
  SELECTABLE_MINUTES,
  WeekDay,
} from "utils/datetime.ts";
import { WeekRange, weekRangeListToMap } from "utils/datetime.ts";
import cx from "utils/cx.ts";
import Button from "base/Button.tsx";
import Select from "base/Select.tsx";
import icons from "icons";

type Props = {
  availabilities: WeekRange[];
  onChange: (ranges: WeekRange[]) => void;
};

export default function AvailabilitySettings(
  { availabilities, onChange }: Props,
) {
  const rangeMap = weekRangeListToMap(availabilities);
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
                <Select
                  value={startTime}
                  onChange={(v) => {
                    onChange(v, "startTime", i);
                  }}
                >
                  {SELECTABLE_MINUTES.map((hourMinutes) => (
                    <option>{hourMinutes}</option>
                  ))}
                </Select>
                ~
                <Select
                  value={endTime}
                  onChange={(v) => {
                    onChange(v, "endTime", i);
                  }}
                >
                  {SELECTABLE_MINUTES.map((hourMinutes) => (
                    <option>{hourMinutes}</option>
                  ))}
                </Select>
                <Button
                  size="xs"
                  style="none"
                  onClick={() =>
                    onRemove(i)}
                >
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
