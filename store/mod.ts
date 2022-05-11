// @deno-types=https://cdn.esm.sh/v78/firebase@9.8.1/app/dist/app/index.d.ts
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
// @deno-types=https://cdn.esm.sh/v78/firebase@9.8.1/auth/dist/auth/index.d.ts
import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";
// @deno-types=https://cdn.esm.sh/v78/firebase@9.8.1/firestore/dist/firestore/index.d.ts
import {
  collection,
  getDocs,
  getFirestore,
} from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore.js";

import { envReady } from "../utils/dotenv.ts";
await envReady;

const app = initializeApp({
  apiKey: Deno.env.get("FIREBASE_API_KEY"),
  authDomain: Deno.env.get("FIREBASE_AUTH_DOMAIN"),
  projectId: Deno.env.get("FIREBASE_PROJECT_ID"),
  storageBucket: Deno.env.get("FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: Deno.env.get("FIREBASE_MESSING_SENDER_ID"),
  appId: Deno.env.get("FIREBASE_APP_ID"),
});

const auth = getAuth(app);

await signInWithEmailAndPassword(
  auth,
  Deno.env.get("ADMIN_USER")!,
  Deno.env.get("ADMIN_PASSWORD")!,
);

const store = getFirestore(app);

const querySnapshot = await getDocs(collection(store, "users"));

querySnapshot.forEach((doc) => {
  console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
});
