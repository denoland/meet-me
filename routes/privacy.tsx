// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import { useData } from "aleph/react";
import * as gfm from "gfm/mod.ts";

export const data = {
  async get(_: Request, _ctx: Context) {
    const text = await Deno.readTextFile("./PRIVACY.md");
    return Response.json({ text });
  },
};

export default function Privacy() {
  const { data } = useData<{ text: string }>();
  const html = gfm.render(data.text);
  return (
    <div
      className="max-w-screen-md mx-auto markdown-body"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
