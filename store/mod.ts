// @deno-types=https://cdn.esm.sh/v83/firebase@9.8.2/app/dist/app/index.d.ts
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.2/firebase-app.js";
// @deno-types=https://cdn.esm.sh/v83/firebase@9.8.2/auth/dist/auth/index.d.ts
import {
  getAuth,
  signInWithCustomToken,
  signOut,
  // signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.8.2/firebase-auth.js";
// @deno-types=https://cdn.esm.sh/v83/firebase@9.8.2/firestore/dist/firestore/index.d.ts
import {
  addDoc,
  collection,
  doc,
  getDocs,
  getFirestore,
  setDoc,
} from "https://www.gstatic.com/firebasejs/9.8.2/firebase-firestore.js";
import { createCustomToken } from "https://deno.land/x/deno_gcp_admin@0.0.5/auth.ts";

import { envReady } from "../utils/dotenv.ts";
await envReady;

const app = initializeApp({
  apiKey: Deno.env.get("FIREBASE_API_KEY"),
  authDomain: Deno.env.get("FIREBASE_AUTH_DOMAIN"),
  projectId: Deno.env.get("FIREBASE_PROJECT_ID"),
  storageBucket: Deno.env.get("FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: Deno.env.get("FIREBASE_MESSING_SENDER_ID"),
  appId: Deno.env.get("FIREBASE_APP_ID"),
  measurementId: Deno.env.get("FIREBASE_MEASUREMENT_ID"),
});

const auth = getAuth(app);

/** The service account keys used when connecting to Firebase as admin. */
const privateKey = Deno.env.get("GOOGLE_PRIVATE_KEY") ?? "";
const keys = {
  client_email: Deno.env.get("GOOGLE_CLIENT_EMAIL") ?? "",
  private_key:
    (privateKey.startsWith(`"`)
      ? JSON.parse(privateKey)
      : privateKey) as string,
  private_key_id: Deno.env.get("GOOGLE_PRIVATE_KEY_ID") ?? "",
};

const token = await createCustomToken(keys);

await signInWithCustomToken(auth, token);
const db = getFirestore(app);

export interface User {
  id: string;
  email: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
  slug?: string;
  googleRefreshToken?: string;
  googleAccessToken?: string;
  googleAccessTokenExpres?: Date;
  timeZone?: string;
}

const user: User = {
  id: "kitsonk",
  email: "kitson@deno.com",
  name: "Kitson Kelly",
  givenName: "Kitson",
  familyName: "Kelly",
};

await setDoc(doc(db, "users", user.id), user);

const ref = await addDoc(
  collection(doc(db, "users", user.id), "availability"),
  {
    weekDay: "SUN",
    startTime: 32_400,
    endTime: 61_200,
  },
);

console.log("ref:", ref.id);

await signOut(auth);

console.log("signed out");
