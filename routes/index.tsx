// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
import { useForwardProps } from "aleph/react";

export default function LandingPage() {
  const { clientId, redirectUri } = useForwardProps<{ clientId: string, redirectUri: string }>();

  const signin = () => {
    google.accounts.oauth2.initCodeClient({
      client_id: clientId,
      scope: "https://www.googleapis.com/auth/calendar",
      redirect_uri: redirectUri,
      ux_mode: "redirect",
      state: Math.random().toString(36).slice(2),
    }).requestCode();
  };

  return (
    <div className="flex items-center justify-center py-36">
      <button onClick={signin} className="border border-1 px-2 rounded">
        Sign in with Google
      </button>
    </div>
  );
}
