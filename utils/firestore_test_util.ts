// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import { firestore } from "./firestore.ts";

export async function resetEmulatorDocuments() {
  const resp = await fetch(
    `http://localhost:8080/emulator/v1/projects/${firestore.app.options.projectId}/databases/(default)/documents`,
    { method: "DELETE" },
  );
  await resp.arrayBuffer();
}

export function setTestFirebaseEnvVars() {
  Deno.env.set("FIREBASE_API_KEY", "abcdefg12345");
  Deno.env.set("FIREBASE_AUTH_DOMAIN", "example.firebaseapp.com");
  Deno.env.set("FIREBASE_PROJECT_ID", "example");
  Deno.env.set("FIREBASE_STORAGE_BUCKET", "example.appspot.com");
  Deno.env.set("FIREBASE_MESSING_SENDER_ID", "1234567890");
  Deno.env.set("FIREBASE_APP_ID", "1:1234567890:web:a2bc3d");
  Deno.env.set("FIREBASE_MEASUREMENT_ID", "G-123456");
}
