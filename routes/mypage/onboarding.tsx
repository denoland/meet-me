// Copyright 2022 the Deno authors. All rights reserved. MIT license.
import { useEffect, useState } from "react";
import { useForwardProps, useRouter } from "aleph/react";
import { UserForClient } from "utils/db.ts";
import Button from "base/Button.tsx";
import icons from "icons";

export default function OnboardingPage() {
  const { user } = useForwardProps<{ user: UserForClient }>();
  const { redirect } = useRouter();
  useEffect(() => {
    if (!user) {
      redirect("/");
    }
  });

  if (!user) {
    return null;
  }

  return (
    <div className="px-8 py-4">
      <ChooseURL />
    </div>
  );
}

function ChooseURL() {
  const [slug, setSlug] = useState("");
  const [a, setA] = useState(true);
  return (
    <div
      className="absolute w-screen transition-500"
      style={{ opacity: a ? "1" : "0" }}
    >
      <div className="max-w-md mx-auto">
        <h1 className="text-lg">
          Welcome to <span className="font-semibold">Meet Me</span>!
        </h1>
      </div>
      <div className="mt-8 flex flex-col gap-4 border rounded-lg border-gray-300 py-8 px-8 max-w-lg mx-auto">
        <h2 className="font-medium text-lg">Create your Meet Me URL</h2>
        <p className="text-gray-500">
          Choose a URL that describes you or your business in a concise way.
          Make it short and easy to remember so you can share links with ease.
        </p>
        <div className="flex items-center gap-2">
          <span>https://meet-me.deno.dev/</span>
          <input
            className="rounded-lg py-2 px-4 text-black"
            placeholder="url"
            onChange={(e) => {
              setSlug(e.target.value);
            }}
            value={slug}
          />
        </div>
        <div className="self-end mt-4">
          <Button
            disabled={slug === ""}
            style="primary"
            onClick={() => setA(false)}
          >
            Continue
            <icons.CaretRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
