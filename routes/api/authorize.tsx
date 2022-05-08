// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

export const data = {
  async get(req: Request, ctx: Context) {
    const params = new URLSearchParams(new URL(req.url).search);
    const form = new URLSearchParams();
    form.append("code", params.get("code")!);
    form.append("client_id", Deno.env.get("CLIENT_ID")!);
    form.append("client_secret", Deno.env.get("CLIENT_SECRET")!);
    form.append("grant_type", "authorization_code");
    form.append("redirect_uri", Deno.env.get("REDIRECT_URI")!);
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      body: form,
    });
    const resp = await res.json();
    return ctx.json({ ...resp });
  },
};
