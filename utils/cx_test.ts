// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import { assertEquals } from "std/testing/asserts.ts";
import cx from "./cx.ts";

Deno.test("cx", () => {
  assertEquals(cx("foo", true && "bar", false && "baz"), "foo bar");
  assertEquals(cx("foo", { bar: true, baz: false }), "foo bar");
  assertEquals(cx("foo", ["bar", 123]), "foo bar");
});
