// Copyright 2022 the Deno authors. All rights reserved. MIT license.
/** @jsxImportSource https://esm.sh/react@18.2.0 */

import { useEffect, useState } from "react";
import { usePortal } from "aleph/react";
import cx from "utils/cx.ts";
import events from "utils/events.ts";
import { Danger, Info } from "./Status.tsx";

type Message = {
  type: "danger" | "success";
  title: string;
  message: string;
  details?: string[];
};

export function notify(msg: Message) {
  events.emit("notification", msg);
}

export function NotificationProvider() {
  const [queue, setQueue] = useState<(Message & { key: number })[]>([]);
  const portal = usePortal({ className: "notification-overlay" });

  useEffect(() => {
    const listener = (e: Record<string, unknown>) => {
      const key = Date.now();
      setQueue((queue) => [...queue, { ...e as Message, key }]);
      setTimeout(() => {
        setQueue((queue) => queue.filter((m) => m.key !== key));
      }, 8000);
    };

    events.on("notification", listener);

    return () => {
      events.off("notification", listener);
    };
  }, []);

  if (queue.length === 0) {
    return null;
  }

  return portal(
    <div className="fixed z-60 right-5 bottom-5 flex flex-col gap-3">
      {queue.map((msg) => (
        msg.type === "success"
          ? <SuccessMessage msg={msg} key={msg.key} />
          : <DangerMessage msg={msg} key={msg.key} />
      ))}
    </div>,
  );
}

function useTransitionFlag() {
  const [state, setState] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setState(true);
    }, 20);
  }, []);
  return state;
}

function DangerMessage({ msg }: { msg: Message & { key: number } }) {
  const flag = useTransitionFlag();
  return (
    <div
      className={cx(
        "flex gap-3 px-6 py-5 border-1 border-red bg-red-300/5 shadow-md shadow-red-danger/100 rounded-lg !transition-500",
        {
          "!opacity-0": !flag,
          "!translate-x-5": !flag,
        },
      )}
      key={msg.key}
    >
      <Danger />
      <div>
        <h2 className="font-semibold text-md text-danger !leading-5">
          {msg.title}
        </h2>
        <p className="text-danger text-sm mt-1 max-w-120">
          {msg.message}
        </p>
      </div>
    </div>
  );
}

function SuccessMessage({ msg }: { msg: Message & { key: number } }) {
  const flag = useTransitionFlag();

  return (
    <div
      className={cx(
        "flex gap-3 px-6 py-5 border-1 border-blue bg-dark-400 shadow shadow-gray-100 rounded-lg transition-500",
        {
          "!opacity-0": !flag,
          "!translate-x-5": !flag,
        },
      )}
      key={msg.key}
    >
      <Info />
      <div>
        <h2 className="font-semibold text-md text-white !leading-5">
          {msg.title}
        </h2>
        <p className="text-sm text-gray-300 mt-1 max-w-120">
          {msg.message}
        </p>
      </div>
    </div>
  );
}
