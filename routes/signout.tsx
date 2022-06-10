// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import { useEffect } from "react";

export default function Settings() {
  useEffect(() => {
    // This triggers Signout middleware
    location.reload();
  });
  return <div></div>;
}
