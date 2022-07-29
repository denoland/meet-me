// Copyright 2022 the Deno authors. All rights reserved. MIT license.

// Returns the count of the all users.
// This script loads the entire users in memory and very slow.
import "https://deno.land/std@0.150.0/dotenv/load.ts";
import {
  collection,
  getDocs,
  initFirestore,
  query,
} from "../utils/firestore.ts";

const firestore = initFirestore();

const snapshot = await getDocs(query(collection(firestore, "users")));

console.log(snapshot.size);
