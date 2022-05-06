// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

/** Gets the payload object from jwt token */
export function parsePayload(jwt: string) {
  const base64 = jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  const json = decodeURIComponent(
    atob(base64).split("").map(
      (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2),
    ).join(""),
  );
  const payload = JSON.parse(json);
  return payload;
}
