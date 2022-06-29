// Copyright 2022 the Deno authors. All rights reserved. MIT license.

/** @jsx React.createElement */

import presetUno from "@unocss/preset-uno.ts";
import React from "react";
import { renderToReadableStream } from "react-dom/server";
import { Router } from "aleph/react";
import { serve } from "aleph/server";
import "std/dotenv/load.ts";
import { initFirestore } from "utils/firestore.ts";

// pre-import route modules for serverless env that doesn't support the dynamic imports.
import routeModules from "./routes/_export.ts";

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
  routes: "./routes/**/*.{ts,tsx}",
  routeModules,
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
  ssr: {
    dataDefer: false,
    render: (ctx) => renderToReadableStream(<Router ssrContext={ctx} />, ctx),
  },
});
