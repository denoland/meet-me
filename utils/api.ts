// Copyright 2022 the Deno authors. All rights reserved. MIT license.
export function badRequest(message = "") {
  return Response.json({ message }, { status: 400 });
}

export function ok(obj = {}) {
  return Response.json(obj);
}
