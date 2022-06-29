// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import { useEffect } from "react";

export default function Signout() {
  useEffect(() => {
    // This triggers Signout middleware
    location.reload();
  });

  return null;
}
