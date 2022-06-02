// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import mitt from "https://esm.sh/mitt@3.0.0";

// shared event emitter
export default mitt<Record<string, Record<string, unknown>>>();
