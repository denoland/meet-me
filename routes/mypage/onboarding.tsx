// Copyright 2022 the Deno authors. All rights reserved. MIT license.
import { useEffect, useState } from "react";
import { useForwardProps, useRouter } from "aleph/react";
import { UserForClient } from "utils/db.ts";
import Button from "base/Button.tsx";
import icons from "icons";
import cx from "utils/cx.ts";

type Step = "slug" | "availability";

export default function OnboardingPage() {
  const { user } = useForwardProps<{ user: UserForClient }>();
  console.log("user", user);
  const { redirect } = useRouter();
  const [step, setStep] = useState<Step>("slug");
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
      {step === "slug" && <ChooseURL onFinish={() => setStep("availability")} />}
      {step === "availability" && <ChooseAvailabilities />}
    </div>
  );
}

function ChooseURL({ onFinish }: {onFinish: () => void}) {
  const [slug, setSlug] = useState("");
  const [fadingOut, setFadingOut] = useState(false);
  const [updating, setUpdating] = useState(false);

  const updateSlug = async () => {
    setUpdating(true);
    try {
      // TODO(kt3k): Use some API updating utility
      const res = await fetch("/api/user", {
        method: "PATCH",
        body: JSON.stringify({ slug })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message)
      }
      setFadingOut(true);
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
      onFinish();
    } catch (e) {
      alert(e.message);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div
      className={cx("absolute w-screen transition-500", {
        "opacity-0": fadingOut,
        "!-translate-x-5": fadingOut,
      })}
    >
      <div className="max-w-md mx-auto">
        <h1 className="text-lg">
          Welcome to <span className="font-semibold">Meet Me</span>!
        </h1>
      </div>
      <div className="mt-8 flex flex-col gap-4 border rounded-lg border-gray-600 py-8 px-8 max-w-lg mx-auto">
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
            disabled={slug === "" || updating}
            style="primary"
            onClick={updateSlug}
          >
            Continue
            <icons.CaretRight />
          </Button>
        </div>
      </div>
    </div>
  );
}


function ChooseAvailabilities() {
  const [updating, setUpdating] = useState(false);
  const updateAvailabilities = () => {};
  const [fadingOut, setFadingOut] = useState(false);
  const [fadingIn, setFadingIn] = useState(true);
  const [timeZone, setTimeZone] = useState("");
  useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setFadingIn(false);
  }, []);
  return (
    <div
    className={cx("absolute w-screen transition-500", {
      "opacity-0": fadingOut || fadingIn,
      "!-translate-x-5": fadingOut,
      "!translate-x-5": fadingIn,
    })}
  >
    <div className="mt-8 flex flex-col gap-4 border rounded-lg border-gray-600 py-8 px-8 max-w-lg mx-auto">
      <h2 className="font-medium text-lg">Set your availability</h2>
      <p className="text-gray-500">
        Timezone: {timeZone}
      </p>
      <ul>
        <li>TODO(kt3k): List Availability Ranges</li>
      </ul>
      <div className="self-end mt-4">
        <Button
          disabled={updating || true}
          style="primary"
          onClick={updateAvailabilities}
        >
          Continue
          <icons.CaretRight />
        </Button>
      </div>
    </div>
  </div>

  )
}
