// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
import { useForwardProps } from "aleph/react";
import icons from "icons";

export default function LandingPage() {
  const { signin } = useForwardProps<
    { signin: () => void }
  >();
  return (
    <div className="max-w-screen-xl mx-auto flex items-center px-4 pt-36">
      <div className="max-w-130">
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
    </div>
  );
}
