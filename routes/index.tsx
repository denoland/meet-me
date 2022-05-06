// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
import { useEffect, useRef } from "react";
import { useForwardProps } from "aleph/react";
import { parsePayload } from "utils/jwt.ts";

export default function LandingPage() {
  const { clientId } = useForwardProps<{ clientId: string }>();
  const ref = useRef(null);
  useEffect(() => {
    google.accounts.id.initialize({
      client_id: clientId,
      callback: (res) => {
        const payload = parsePayload(res.credential);
        alert(`Successfully signed in as ${payload.email} (${payload.name})!`);
      },
    });
    google.accounts.id.renderButton(ref.current!, {});
  }, []);

  return (
    <div className="flex items-center justify-center py-36">
      <div ref={ref} id="google-sign-in"></div>
    </div>
  );
}
