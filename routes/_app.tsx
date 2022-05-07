// Copyright 2022 the Deno authors. All rights reserved. MIT license.
import type { ReactNode } from "react";
import { forwardProps, useData } from "aleph/react";
import { Header } from "layout/Header.tsx";
import { Footer } from "layout/Footer.tsx";
import { envReady } from "utils/dotenv.ts";

export const data = {
  async get(_: Request, ctx: Context) {
    await envReady;
    return ctx.json({
      clientId: Deno.env.get("CLIENT_ID"),
    });
  },
};

export default function App({ children }: { children?: ReactNode }) {
  const { data: { clientId } } = useData<{ clientId: string }>();
  return (
    <>
      <Header />
      {forwardProps(children, { clientId })}
      <Footer />
    </>
  );
}
