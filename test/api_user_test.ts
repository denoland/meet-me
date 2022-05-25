// Copyright 2022 the Deno authors. All rights reserved. MIT license.
import { assertEquals, assertStringIncludes } from "std/testing/asserts.ts";

const EMAIL = "foo@deno.com";
const EMAIL_ALT = "bar@deno.com";

Deno.test("/api/user", async (t) => {
  const USER_API = "http://localhost:3000/api/user";

  // Starts the server
  const child = Deno.spawnChild(Deno.execPath(), {
    args: [
      "run",
      "-A",
      "https://deno.land/x/aleph@1.0.0-alpha.52/cli.ts",
      "start",
    ],
    stdout: "inherit",
    stderr: "inherit",
  });
  // TODO(kt3k): Race condition. Wait until the server is available
  await new Promise<void>((resolve) => setTimeout(resolve, 10000));

  // Creates user and token for testing
  const createUser = async (email: string) => {
    const resp = await fetch(USER_API, {
      method: "POST",
      body: `{"email":"${email}"}`,
    });
    const { token } = await resp.json();
    return token;
  };
  const token = await createUser(EMAIL);

  // Util for calling PATCH /api/user
  const patchUser = async (obj: Record<string, unknown>, t = token) => {
    const resp = await fetch(USER_API, {
      method: "PATCH",
      headers: {
        "Cookie": `token=${t}`,
      },
      body: JSON.stringify(obj),
    });
    const x = [resp.status, await resp.json()];
    return x;
  };

  await t.step("PATCH /api/user", async () => {
    const [code, _] = await patchUser({ slug: "foo" });
    assertEquals(code, 200);
    const user =
      await (await fetch(USER_API, { headers: { Cookie: `token=${token}` } }))
        .json();
    assertEquals(user?.slug, "foo");
  });

  await t.step("PATCH /api/user with invalid char in slug", async () => {
    const [code, { message }] = await patchUser({ slug: "%%%" });
    assertEquals(code, 400);
    assertStringIncludes(
      message,
      `The given slug "%%%" includes invalid characters`,
    );
    const user =
      await (await fetch(USER_API, { headers: { Cookie: `token=${token}` } }))
        .json();
    assertEquals(user?.slug, "foo"); // Not changed
  });

  await t.step("PATCH /api/user with invalid name", async () => {
    const [code, { message }] = await patchUser({ slug: "mypage" });
    assertEquals(code, 400);
    assertStringIncludes(message, `The given slug "mypage" is not available`);
    const user =
      await (await fetch(USER_API, { headers: { Cookie: `token=${token}` } }))
        .json();
    assertEquals(user?.slug, "foo"); // Not changed
  });

  await t.step("PATCH /api/user with non available name", async () => {
    // Make user and gets `bar` for it
    await patchUser({ slug: "bar" }, await createUser(EMAIL_ALT));

    // `bar` is not available anymore because it's taken in the above
    const [code, { message }] = await patchUser({ slug: "bar" });
    assertEquals(code, 400);
    assertStringIncludes(message, `The given slug "bar" is not available`);
    const user =
      await (await fetch(USER_API, { headers: { Cookie: `token=${token}` } }))
        .json();
    assertEquals(user?.slug, "foo"); // Not changed
  });

  child.kill("SIGINT");
  await child.status;
});
