// Copyright 2022 the Deno authors. All rights reserved. MIT license.
import type { ReactNode } from "react";
import { forwardProps, useData } from "aleph/react";
import { Header } from "layout/Header.tsx";
import { Footer } from "layout/Footer.tsx";
import { envReady } from "utils/dotenv.ts";
import { getUserByToken, User } from "utils/db.ts";

export const data = {
  async get(_: Request, ctx: Context) {
    await envReady;
    const token = ctx.cookies.get("token");
    const user = !!token ? await getUserByToken(token) : undefined;
    return ctx.json({
      user,
      clientId: Deno.env.get("CLIENT_ID"),
      redirectUri: Deno.env.get("REDIRECT_URI"),
    });
  },
};

export default function App({ children }: { children?: ReactNode }) {
  const { data: { clientId, redirectUri, user } } = useData<
    { clientId: string; redirectUri: string; user: User | undefined }
  >();

  const signin = () => {
    google.accounts.oauth2.initCodeClient({
      client_id: clientId,
      scope: "email profile openid https://www.googleapis.com/auth/calendar",
      redirect_uri: redirectUri,
      ux_mode: "redirect",
      state: Math.random().toString(36).slice(2),
    }).requestCode();
  };

  return (
    <div className="min-h-screen bg-dark-400 text-white overflow-x-hidden">
      <Header signin={signin} />
      {forwardProps(children, { clientId, redirectUri, signin, user })}
      <Footer />
    </div>
  );
}
