// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import presetUno from "@unocss/preset-uno.ts";
import ssr from "aleph/react-ssr";
import { serve } from "aleph/server";
import { initFirestore } from "utils/firestore.ts";
import "std/dotenv/load.ts";

// pre-import route modules for serverless env that doesn't support the dynamic imports.
import routes from "./routes/_export.ts";

initFirestore();

const Signout: Middleware = {
  fetch(req) {
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
  routeGlob: "./routes/**/*.{ts,tsx}",
  routes,
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
  middlewares: [
    Signout,
  ],
  ssr,
});
