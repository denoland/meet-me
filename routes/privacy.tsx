// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import { useData } from "aleph/react";
import * as gfm from "gfm/mod.ts";

let html: string;
export const data = {
  async get(_: Request, _ctx: Context) {
    if (typeof html === "undefined") {
      const text = await Deno.readTextFile("./PRIVACY.md");
      html = gfm.render(text);
    }
    return Response.json({ html });
  },
};

export default function Privacy() {
  const { data } = useData<{ html: string }>();
  return (
    <div
      className="max-w-screen-md mx-auto markdown-body"
      dangerouslySetInnerHTML={{ __html: data.html }}
    />
  );
}
