// Copyright 2022 the Deno authors. All rights reserved. MIT license.
import { assertEquals } from "std/testing/asserts.ts";

const EMAIL = "foo@deno.com";

Deno.test("/api/user", async (t) => {
  const USER_API = "http://localhost:3000/api/user";
  const child = Deno.spawnChild(Deno.execPath(), {
    args: [
      "run",
      "-A",
      "https://raw.githubusercontent.com/kt3k/aleph.js/send-signal-on-exit/cli.ts",
      "start",
    ],
    stdout: "inherit",
    stderr: "inherit",
  });
  await new Promise<void>((resolve) => setTimeout(resolve, 10000));

  const resp = await fetch(USER_API, {
    method: "POST",
    body: `{"email":"${EMAIL}"}`,
  });
  const { token } = await resp.json();

  const patchUser = async (obj: Record<string, unknown>) => {
    const resp = await fetch(USER_API, {
      method: "PATCH",
      headers: {
        "Cookie": `token=${token}`,
      },
      body: JSON.stringify(obj),
    });
    const x = [resp.status, await resp.text()];
    console.log(x);
    console.log(x[1]);
    return x;
  };

  await t.step("PATCH /api/user", async () => {
    const [code, _] = await patchUser({ slug: "foo" });
    assertEquals(code, 200);
    const user =
      await (await fetch(USER_API, { headers: { Cookie: `token=${token}` } }))
        .json();
    console.log(user);
    assertEquals(user?.slug, "foo");
  });

  // TODO(kt3k): add more test cases.

  child.kill("SIGINT");
  await child.status;
});
