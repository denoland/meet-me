// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import { assertEquals, assertStringIncludes } from "std/testing/asserts.ts";
import { MockServer } from "aleph/server/mock.ts";
import { MIN } from "utils/datetime.ts";
import { initFirestore, useEmulator } from "utils/firestore.ts";
import {
  resetEmulatorDocuments,
  setTestFirebaseEnvVars,
} from "utils/firestore_test_util.ts";

const EMAIL = "foo@deno.com";
const EMAIL_ALT = "bar@deno.com";

Deno.test(
  "/api/user",
  { sanitizeOps: false, sanitizeResources: false },
  async (t) => {
    setTestFirebaseEnvVars();
    useEmulator(initFirestore());
    await resetEmulatorDocuments();
    const api = new MockServer({
      routes: "./routes/**/*.{ts,tsx}",
    });

    await new Promise<void>((resolve) => {
      (async () => {
        for (let i = 0; i < 100; i++) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          try {
            const res = await api.fetch("/api/user");
            await res.body?.cancel();
            resolve();
            break;
          } catch (e) {
            if (e instanceof Deno.errors.PermissionDenied) {
              throw e;
            }
            // retry
          }
        }
      })();
    });

    // Creates user and token for testing
    const createUser = async (email: string) => {
      const resp = await api.fetch("/api/user", {
        method: "POST",
        body: `{"email":"${email}"}`,
      });
      const { token } = await resp.json();
      return token;
    };
    const token = await createUser(EMAIL);

    // Util for calling PATCH /api/user
    const patchUser = async (obj: Record<string, unknown>, t = token) => {
      const resp = await api.fetch("/api/user", {
        method: "PATCH",
        headers: {
          "Cookie": `token=${t}`,
        },
        body: JSON.stringify(obj),
      });
      const x = [resp.status, await resp.json()];
      return x;
    };

    await t.step("PATCH /api/user with slug", async () => {
      const [code, _] = await patchUser({ slug: "foo" });
      assertEquals(code, 200);
      const user = await (await api.fetch("/api/user", {
        headers: { Cookie: `token=${token}` },
      }))
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
      const user = await (await api.fetch("/api/user", {
        headers: { Cookie: `token=${token}` },
      }))
        .json();
      assertEquals(user?.slug, "foo"); // Not changed
    });

    await t.step("PATCH /api/user with invalid name", async () => {
      const [code, { message }] = await patchUser({ slug: "mypage" });
      assertEquals(code, 400);
      assertStringIncludes(message, `The given slug "mypage" is not available`);
      const user = await (await api.fetch("/api/user", {
        headers: { Cookie: `token=${token}` },
      }))
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
      const user = await (await api.fetch("/api/user", {
        headers: { Cookie: `token=${token}` },
      }))
        .json();
      assertEquals(user?.slug, "foo"); // Not changed
    });

    await t.step("PATCH /api/user with time zone", async () => {
      const [code, _] = await patchUser({ timeZone: "Europe/London" });
      assertEquals(code, 200);
      const user = await (await api.fetch("/api/user", {
        headers: { Cookie: `token=${token}` },
      }))
        .json();
      assertEquals(user?.timeZone, "Europe/London");
    });

    await t.step("PATCH /api/user with invalid time zone", async () => {
      const [code, { message }] = await patchUser({ timeZone: "Foo/Bar" });
      assertEquals(code, 400);
      assertStringIncludes(message, `The given "timeZone" is invalid`);
    });

    await t.step("PATCH /api/user with event types", async () => {
      const id = crypto.randomUUID();
      const [code, _] = await patchUser({
        eventTypes: [{ id, title: "45 Minute Meeting", duration: 45 * MIN }],
      });
      assertEquals(code, 200);
      const user = await (await api.fetch("/api/user", {
        headers: { Cookie: `token=${token}` },
      }))
        .json();
      assertEquals(user?.eventTypes, [{
        id,
        title: "45 Minute Meeting",
        duration: 45 * MIN,
      }]);
    });

    await t.step("PATCH /api/user with non-array event types", async () => {
      const [code, { message }] = await patchUser({
        eventTypes: { title: "45 Minute Meeting", duration: 45 * MIN },
      });
      assertEquals(code, 400);
      assertStringIncludes(message, `"eventTypes" need to be an array.`);
    });

    await t.step("PATCH /api/user with invalid event types", async () => {
      let [code, { message }] = await patchUser({
        eventTypes: [{}],
      });
      assertEquals(code, 400);
      assertStringIncludes(message, `The given eventType is invalid`);

      // the event type misses duration
      [code, { message }] = await patchUser({
        eventTypes: [{ id: crypto.randomUUID(), title: "foo" }],
      });
      assertEquals(code, 400);
      assertStringIncludes(message, `The given eventType is invalid`);

      // the event type misses title
      [code, { message }] = await patchUser({
        eventTypes: [{ id: crypto.randomUUID(), duration: 30 * MIN }],
      });
      assertEquals(code, 400);
      assertStringIncludes(message, `The given eventType is invalid`);

      // the event type misses id
      [code, { message }] = await patchUser({
        eventTypes: [{ title: "Foo", duration: 30 * MIN }],
      });
      assertEquals(code, 400);
      assertStringIncludes(message, `The given eventType is invalid`);

      // the event types have non unique slugs
      [code, { message }] = await patchUser({
        eventTypes: [
          {
            id: crypto.randomUUID(),
            title: "Foo",
            duration: 30 * MIN,
            slug: "30min",
          },
          {
            id: crypto.randomUUID(),
            title: "Bar",
            duration: 30 * MIN,
            slug: "30min",
          },
        ],
      });
      assertEquals(code, 400);
      assertStringIncludes(
        message,
        `More than 1 event type have the same url slug: 30min.`,
      );
    });

    await t.step("PATCH /api/user with availabilities", async () => {
      const [code, _] = await patchUser({
        availabilities: [
          { weekDay: "MON", startTime: "09:00", endTime: "17:00" },
          { weekDay: "TUE", startTime: "09:00", endTime: "17:00" },
          { weekDay: "WED", startTime: "12:00", endTime: "17:00" },
          { weekDay: "THU", startTime: "09:00", endTime: "17:00" },
          { weekDay: "FRI", startTime: "09:00", endTime: "12:00" },
        ],
      });
      assertEquals(code, 200);
      const user = await (await api.fetch("/api/user", {
        headers: { Cookie: `token=${token}` },
      }))
        .json();
      assertEquals(user?.availabilities, [
        { weekDay: "MON", startTime: "09:00", endTime: "17:00" },
        { weekDay: "TUE", startTime: "09:00", endTime: "17:00" },
        { weekDay: "WED", startTime: "12:00", endTime: "17:00" },
        { weekDay: "THU", startTime: "09:00", endTime: "17:00" },
        { weekDay: "FRI", startTime: "09:00", endTime: "12:00" },
      ]);
    });

    await t.step("PATCH /api/user with non-array availabilities", async () => {
      const [code, { message }] = await patchUser({
        availabilities: {
          weekDay: "MON",
          startTime: "09:00",
          endTime: "17:00",
        },
      });
      assertEquals(code, 400);
      assertStringIncludes(message, `"availabilities" need to be an array.`);
    });

    await t.step("PATCH /api/user with invalid availabilities", async () => {
      {
        const [code, { message }] = await patchUser({
          availabilities: [{
            weekDay: "MON",
            startTime: "09:00",
            endTime: "FOO",
          }],
        });
        assertEquals(code, 400);
        assertStringIncludes(message, `The given "range" is invalid`);
      }
      {
        const [code, { message }] = await patchUser({
          availabilities: [{
            weekDay: "MON",
            startTime: "BAR",
            endTime: "17:00",
          }],
        });
        assertEquals(code, 400);
        assertStringIncludes(message, `The given "range" is invalid`);
      }
      {
        const [code, { message }] = await patchUser({
          availabilities: [{
            weekDay: "BON",
            startTime: "09:00",
            endTime: "17:00",
          }],
        });
        assertEquals(code, 400);
        assertStringIncludes(message, `The given "range" is invalid`);
      }
    });
  },
);
