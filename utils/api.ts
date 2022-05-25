// Copyright 2022 the Deno authors. All rights reserved. MIT license.
export function badRequest(message = "") {
  return new Response(JSON.stringify({ message }), {
    status: 400,
    statusText: "Bad Request",
    headers: { "Content-Type": "application/json" },
  });
}

export function ok(obj = {}) {
  return new Response(JSON.stringify(obj), {
    headers: { "Content-Type": "application/json" },
  });
}
