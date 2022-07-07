// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
/** @jsxImportSource https://esm.sh/react@18.2.0 */

import { useEffect, useState } from "react";
import { useForwardProps, useRouter } from "aleph/react";
import icons from "icons";
import cx from "utils/cx.ts";
import { type User } from "utils/db.ts";

export default function LandingPage() {
  const { signin, user } = useForwardProps<
    { signin: () => void; user: User }
  >();
  const { redirect } = useRouter();

  useEffect(() => {
    if (user) {
      if (
        user.slug !== undefined &&
        user.availabilities !== undefined &&
        user.timeZone !== undefined
      ) {
        redirect("/mypage");
      } else {
        redirect("/mypage/onboarding");
      }
    }
  }, []);

  if (user) {
    return null;
  }

  return (
    <div className="max-w-screen-xl mx-auto flex items-center gap-32 px-4 pt-20 sm:!pt-36">
      <div className="max-w-130 sm:flex-shrink-0">
        <p className="flex gap-1 text-sm">
          <span className="block w-3 h-3 rounded-full bg-yellow-500" />
          <span className="block w-3 h-3 rounded-full bg-red-500" />
          <span className="block w-3 h-3 rounded-full bg-blue-500" />
        </p>
        <h1 className="mt-3 font-bold text-5xl leading-none">
          The Calendar by Deno
        </h1>
        <p className="mt-4 text-neutral-300 text-lg font-light">
          This app showcases the use of{" "}
          <a
            className="text-blue-400 cursor-pointer font-medium hover:underline"
            href="https://deno.com/deploy"
            target="_blank"
          >
            Deno Deploy
          </a>{" "}
          with{" "}
          <a
            className="text-blue-400 cursor-pointer font-medium hover:underline"
            href="https://developers.google.com/identity/protocols/oauth2"
            target="_blank"
          >
            Google OAuth API
          </a>{" "}
          integration. It uses{" "}
          <a
            className="text-blue-400 cursor-pointer font-medium hover:underline"
            href="https://alephjs.org/"
            target="_blank"
          >
            Aleph.js
          </a>{" "}
          as frontend &amp; backend framework and{" "}
          <a
            className="text-blue-400 cursor-pointer font-medium hover:underline"
            href="https://firebase.google.com/docs/firestore"
            target="_blank"
          >
            Cloud Firestore
          </a>{" "}
          for the persistence.
        </p>
        <button
          onClick={signin}
          className="rounded-full mt-10 px-6 py-2 bg-neutral-200 hover:bg-neutral-300 flex items-center gap-2 text-black"
        >
          <icons.Google />
          <span className="font-medium">Continue with Google</span>
        </button>
      </div>
      <Dots />
    </div>
  );
}

function Dots() {
  const [isClient, setIsClient] = useState(false);
  const [opacity, setOpacity] = useState(0);
  const thr = 0.03;
  const rows = 9;

  useEffect(() => {
    setIsClient(true);
    setTimeout(() => {
      setOpacity(1);
    }, 1000 / 60);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div
      className="lt-sm:!hidden transition-opacity duration-600"
      style={{ opacity }}
    >
      {[...Array(rows)].map((_, i) => (
        <div
          key={i}
          className="mt-2 flex items-center gap-2 text-sm select-none"
        >
          {[...Array(100)].map((_, j) => {
            const r = Math.random();
            const key = `${i}-${j}`;
            const className = r < thr
              ? "bg-red-600"
              : r < thr * 2
              ? "bg-blue-600"
              : r < thr * 3
              ? "bg-yellow-600"
              : "bg-gray-100/80";
            if (i < 5) {
              return (
                <div
                  key={key}
                  className={cx("w-3 h-3 rounded-full", className)}
                />
              );
            }
            if (i === 5 && j < 10) {
              return (
                <div
                  key={key}
                  className={cx("w-3 h-3 rounded-full", className)}
                />
              );
            }

            return (
              <div
                key={key}
                className="w-3 h-3 border border-gray-100/60 rounded-full"
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
