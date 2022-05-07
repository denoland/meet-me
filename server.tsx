// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import "utils/dotenv.ts";
import presetUno from "@unocss/preset-uno.ts";
import { renderToReadableStream } from "react-dom/server";
import { Router } from "aleph/react";
import { serve } from "aleph/server";

serve({
  port: 3000,
  hmrWebSocketUrl: "ws://localhost:3000/-/hmr",
  config: {
    routes: "./routes/**/*.{ts,tsx}",
    unocss: {
      presets: [presetUno()],
      theme: {
        colors: {
          "default": "#222222",
          "primary": "#026BEB",
          "fresh": "#2FA850",
          "danger": "#E90807",
          "ultralight": "#F8F7F6",
        },
        fontSize: {
          "xs": ".75rem",
        },
      },
    },
  },
  middlewares: [],
  ssr: {
    suspense: false,
    render: (ctx) => renderToReadableStream(<Router ssrContext={ctx} />, ctx),
  },
});
