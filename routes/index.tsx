// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
import { useEffect } from "react";
import { useForwardProps, useRouter } from "aleph/react";
import icons from "icons";
import { User } from "utils/db.ts";

export default function LandingPage() {
  const { signin, user } = useForwardProps<
    { signin: () => void; user: User }
  >();
  const { redirect } = useRouter();
  useEffect(() => {
    if (user) {
      redirect("/mypage/onboarding");
    }
  }, []);
  if (user) {
    return null;
  }
  return (
    <div className="max-w-screen-xl mx-auto flex items-center gap-16 px-4 pt-20 sm:!pt-36">
      <div className="max-w-130 sm:flex-shrink-0">
        <p className="flex gap-1.5">
          <span className="text-yellow-500">●</span>
          <span className="text-red-500">●</span>
          <span className="text-blue-500">●</span>
        </p>
        <h1 className="mt-3 font-bold text-5xl">The Calendar by Deno</h1>
        <p className="mt-4 text-zinc-300 text-lg font-light leading-6">
          We re-engineered the service we built for secure, high-quality
          business meetings, Google Meet, to make it available for all, on any
          device.
        </p>
        <button
          onClick={signin}
          className="rounded-full mt-10 px-4 py-2 bg-zinc-200 flex items-center gap-2 text-black"
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
    <div className="lt-sm:!hidden opacity-60">
      {[...Array(9)].map((_, i) => (
        <div className="flex items-center gap-2">
          {[...Array(100)].map((_, j) => {
            const r = Math.random();
            const thr = 0.02;
            const className = r < thr
              ? "text-red-500"
              : r < thr * 2
              ? "text-blue-500"
              : r < thr * 3
              ? "text-yellow-500"
              : "";
            if (i < 5) {
              return <span className={className}>●</span>;
            }
            if (i === 5 && j < 10) {
              return <span className={className}>●</span>;
            }

            return <span>○</span>;
          })}
        </div>
      ))}
    </div>
  );
}
