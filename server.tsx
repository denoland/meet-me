// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import presetUno from "@unocss/preset-uno";
import { serve } from "aleph/react-server";

import routes from "./routes/_export.ts";

serve({
  port: 3000,
  router: {
    routes,
    glob: "./routes/**/*.{ts,tsx}",
  },
  unocss: {
    presets: [presetUno()],
    theme: {
      colors: {
        "default": "#222222",
        "primary": "#00AC47",
        "fresh": "#00AC47",
        "danger": "#E90807",
      },
    },
  },
  ssr: true,
});
