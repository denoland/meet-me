// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import presetUno from "@unocss/preset-uno.ts";
import { renderToReadableStream } from "react-dom/server";
import { Router } from "aleph/react";
import { serve } from "aleph/server";
import "std/dotenv/load.ts";

const Signout: Middleware = {
  fetch(req: Request, ctx: Context): Response | void {
    const { pathname } = new URL(req.url);
    if (pathname === "/signout") {
      return new Response("", {
        status: 303,
        headers: {
          location: "/",
          "Set-Cookie": "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT",
        },
      });
    }
  },
};

serve({
  port: 3000,
  routes: "./routes/**/*.{ts,tsx}",
  unocss: {
    presets: [presetUno()],
    theme: {
      colors: {
        "default": "#222222",
        "primary": "#00AC47",
        "fresh": "#00AC47",
        "danger": "#E90807",
      },
      fontSize: {
        "xs": ".75rem",
      },
    },
  },
  middlewares: [
    // deno-lint-ignore no-explicit-any
    Signout as any,
  ],
  ssr: {
    dataDefer: false,
    render: (ctx) => renderToReadableStream(<Router ssrContext={ctx} />, ctx),
  },
});
