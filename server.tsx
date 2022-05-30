// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import presetUno from "@unocss/preset-uno.ts";
import { renderToReadableStream } from "react-dom/server";
import { Router } from "aleph/react";
import { serve } from "aleph/server";
import "utils/dotenv.ts";

serve({
  port: 3000,
  routes: "./routes/**/*.{ts,tsx}",
  build: {
    unocss: {
      presets: [presetUno()],
      theme: {
        colors: {
          "default": "#222222",
          "primary": "#00AC47",
          "danger": "#E90807",
        },
        fontSize: {
          "xs": ".75rem",
        },
      },
    },
  },
  middlewares: [],
  ssr: {
    dataDefer: false,
    render: (ctx) => renderToReadableStream(<Router ssrContext={ctx} />, ctx),
  },
});
