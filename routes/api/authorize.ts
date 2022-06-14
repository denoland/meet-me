// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import { parsePayload } from "utils/jwt.ts";
import { createNewTokenForUser, getOrCreateUserByEmail } from "utils/db.ts";

export const GET = async (req: Request) => {
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
  const accessToken = resp.access_token;
  const refreshToken = resp.refresh_token;
  const accessTokenExpiresIn = resp.expires_in;
  const idToken = resp.id_token;
  const idTokenPayload = parsePayload(idToken);
  const email = idTokenPayload.email;

  const user = await getOrCreateUserByEmail(email);
  user.googleRefreshToken = refreshToken;
  user.googleAccessToken = accessToken;
  user.googleAccessTokenExpres = new Date(
    Date.now() + accessTokenExpiresIn * 1000,
  );
  user.picture = idTokenPayload.picture;
  user.name = idTokenPayload.name;
  user.givenName = idTokenPayload.given_name;
  user.familyName = idTokenPayload.family_name;

  const token = await createNewTokenForUser(user);

  // Successfully authorized, redirect to onbording process
  return new Response("", {
    status: 303,
    headers: {
      "Location": "/mypage/onboarding",
      "Set-Cookie": `token=${token}; HttpOnly; Path=/`,
    },
  });
};
