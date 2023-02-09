// Copyright 2022 the Deno authors. All rights reserved. MIT license.

// @deno-types="https://cdn.esm.sh/v83/firebase@9.8.1/app/dist/app/index.d.ts"
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
// @deno-types="https://cdn.esm.sh/v83/firebase@9.8.1/firestore/dist/firestore/index.d.ts"
import {
  addDoc,
  collection,
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  getDocs,
  getFirestore,
  query,
  QuerySnapshot,
  setDoc,
  where,
} from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore.js";

export let firestore: Firestore;

export function initFirestore(): Firestore {
  if (firestore) {
    return firestore;
  }
  const app = initializeApp({
    apiKey: Deno.env.get("FIREBASE_API_KEY"),
    authDomain: Deno.env.get("FIREBASE_AUTH_DOMAIN"),
    projectId: Deno.env.get("FIREBASE_PROJECT_ID"),
    storageBucket: Deno.env.get("FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: Deno.env.get("FIREBASE_MESSING_SENDER_ID"),
    appId: Deno.env.get("FIREBASE_APP_ID"),
    measurementId: Deno.env.get("FIREBASE_MEASUREMENT_ID"),
  });
  firestore = getFirestore(app);
  return firestore;
}

/** Switches to the emulator, used in testing */
export function useEmulator(
  firestore: Firestore,
  hostname = "localhost",
  port = 8080,
) {
  connectFirestoreEmulator(firestore, hostname, port);
}

export {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
};

export function getFirstData<T>(
  snapshot: QuerySnapshot,
): T | undefined {
  if (snapshot.empty) {
    return undefined;
  } else {
    return snapshot.docs[0].data() as T;
  }
}
