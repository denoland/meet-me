// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import { useEffect } from "react";
import { useForwardProps, useRouter } from "aleph/react";
import icons from "icons";
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
          <span className="text-yellow-500">●</span>
          <span className="text-red-500">●</span>
          <span className="text-blue-500">●</span>
        </p>
        <h1 className="mt-3 font-bold text-5xl">The Calendar by Deno</h1>
        <p className="mt-4 text-neutral-300 text-lg font-light leading-7">
          This app showcases the use of{" "}
          <a
            className="text-blue-400 cursor-pointer font-medium"
            href="https://deno.com/deploy"
            target="_blank"
          >
            Deno Deploy
          </a>{" "}
          with{" "}
          <a
            className="text-blue-400 cursor-pointer font-medium"
            href="https://developers.google.com/identity/protocols/oauth2"
            target="_blank"
          >
            Google OAuth API
          </a>{" "}
          integration. It uses{" "}
          <a
            className="text-blue-400 cursor-pointer font-medium"
            href="https://alephjs.org/"
            target="_blank"
          >
            Aleph.js
          </a>{" "}
          as frontend &amp; backend framework and{" "}
          <a
            className="text-blue-400 cursor-pointer font-medium"
            href="https://firebase.google.com/docs/firestore"
            target="_blank"
          >
            Cloud Firestore
          </a>{" "}
          for the persistence.
        </p>
        <button
          onClick={signin}
          className="rounded-full mt-10 px-4 py-2 bg-neutral-200 flex items-center gap-2 text-black"
        >
          <icons.Google />
          <span className="font-medium">Continue with Google</span>
        </button>
      </div>
      <RightArea />
    </div>
  );
}

function RightArea() {
  return (
    <div className="lt-sm:!hidden opacity-75">
      {[...Array(9)].map((_, i) => (
        <div key={i} className="flex items-center gap-2 text-sm select-none">
          {[...Array(100)].map((_, j) => {
            const r = Math.random();
            const thr = 0.02;
            const key = `${i}-${j}`;
            const className = r < thr
              ? "text-red-500"
              : r < thr * 2
              ? "text-blue-500"
              : r < thr * 3
              ? "text-yellow-500"
              : "";
            if (i < 5) {
              return <span key={key} className={className}>●</span>;
            }
            if (i === 5 && j < 10) {
              return <span key={key} className={className}>●</span>;
            }

            return <span key={key}>○</span>;
          })}
        </div>
      ))}
    </div>
  );
}
