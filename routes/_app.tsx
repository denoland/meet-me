// Copyright 2022 the Deno authors. All rights reserved. MIT license.
import type { ReactNode } from "react";
import { Header } from "layout/Header.tsx";
import { Footer } from "layout/Footer.tsx";

export default function App({ children }: { children?: ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
