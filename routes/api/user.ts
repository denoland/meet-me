// Copyright 2022 the Deno authors. All rights reserved. MIT license.
import { badRequest, ok } from "utils/api.ts";
import {
  createNewTokenForUser,
  getOrCreateUserByEmail,
  getUserBySlug,
  getUserByToken,
  saveUser,
  unavailableUserSlugs,
} from "utils/db.ts";

export const data = {
  /** Creates a user. Used only for testing.
   *
   * TODO(kt3k): Disable/remove this on production */
  async post(req: Request, _ctx: Context) {
    const { email } = await req.json();
    const user = await getOrCreateUserByEmail(email);
    const token = await createNewTokenForUser(user);
    return ok({ token });
  },
  /** Gets a user. Used only for testing.
   *
   * TODO(kt3k): Disable/remove this on production */
  async get(_req: Request, ctx: Context) {
    const token = ctx.cookies.get("token");

    if (!token) {
      return badRequest("No session token is given.");
    }

    const user = await getUserByToken(token);
    return ok(user);
  },
  /** Updates user's info */
  async patch(req: Request, ctx: Context) {
    const token = ctx.cookies.get("token");

    if (!token) {
      return badRequest("No session token is given.");
    }

    const user = await getUserByToken(token);
    if (!user) {
      return badRequest("There's no user for the given token");
    }

    const { slug } = await req.json();
    if (slug) {
      if (!/^[0-9A-Za-z-_]+$/.test(slug)) {
        return badRequest(
          `The given slug "${slug}" includes invalid characters. The slug can contain only alphabets, numbers, -, and _.`,
        );
      }
      if (unavailableUserSlugs.includes(slug)) {
        return badRequest(`The given slug "${slug}" is not available`);
      }
      const someoneThatHasSlug = await getUserBySlug(slug);
      if (someoneThatHasSlug && someoneThatHasSlug.id !== user.id) {
        return badRequest(`The given slug "${slug}" is not available`);
      }
      user.slug = slug;
    }

    await saveUser(user);
    return ok();
  },
};
