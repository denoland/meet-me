// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import { config } from "std/dotenv/mod.ts";

export const envReady = config({ export: true });
