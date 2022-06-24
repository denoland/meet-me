// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import { assertEquals, assertRejects } from "std/testing/asserts.ts";
import { createUserByEmail, getUserById } from "./db.ts";
import { initFirestore, useEmulator } from "./firestore.ts";
import {
  resetEmulatorDocuments,
  setTestFirebaseEnvVars,
} from "./firestore_test_util.ts";

Deno.test(
  "test db using firestore local emulator",
  { sanitizeOps: false, sanitizeResources: false },
  async (t) => {
    setTestFirebaseEnvVars();
    useEmulator(initFirestore());
    // Resets the emulators data
    await resetEmulatorDocuments();
    await t.step({
      name: "createUserByEmail",
      async fn() {
        const email = "john@example.com";
        const { id } = await createUserByEmail(email);
        const user = await getUserById(id);
        assertEquals(user?.email, email);

        await assertRejects(
          () => createUserByEmail(email),
          Error,
          "The email is already userd by another user",
        );
      },
      sanitizeOps: false,
      sanitizeResources: false,
    });
  },
);
