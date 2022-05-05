// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
import { useEffect, useRef } from "react";
import { useForwardProps } from "aleph/react";

export default function LandingPage() {
  const { clientId } = useForwardProps<{ clientId: string }>();
  const ref = useRef(null);
  useEffect(() => {
    google.accounts.id.initialize({
      client_id: clientId,
      callback: (res) => {
        const jwt = res.credential;
        const base64 = jwt.split(".")[1].replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(atob(base64).split("").map(
          (c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));
        const payload = JSON.parse(json);
        alert(`Successfully signed in as ${payload.email} (${payload.name})!`);
      }
    });
    google.accounts.id.renderButton(ref.current!, {})
  }, []);

  return (
    <div className="flex items-center justify-center py-36">
      <div ref={ref} id="google-sign-in"></div>
    </div>
  );
}
