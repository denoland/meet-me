// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import Dropdown from "base/Dropdown.tsx";
import { TimeZone, timeZones } from "utils/datetime.ts";

type Props = {
  timeZone: string;
  onTimeZoneSelect: (timeZone: TimeZone) => void;
};

export default function TimeZoneSelect({ timeZone, onTimeZoneSelect }: Props) {
  return (
    <p className="text-neutral-400">
      Timezone:{" "}
      <Dropdown
        trigger="click"
        render={() => (
          <div className="bg-white shadow-lg rounded-lg py-2 h-48 overflow-scroll">
            <ul>
              {timeZones.map((timeZone) => (
                <li
                  key={timeZone}
                  className="cursor-pointer hover:bg-neutral-100 px-2 py-1"
                  onClick={() => {
                    onTimeZoneSelect(timeZone);
                  }}
                >
                  {timeZone}
                </li>
              ))}
            </ul>
          </div>
        )}
      >
        <span className="text-white underline cursor-pointer">
          {timeZone}
        </span>
      </Dropdown>
    </p>
  );
}
