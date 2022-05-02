// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import { createPortal } from "react-dom";
import { hydrateRoot } from "react-dom/client";
import { Router } from "aleph/react";

// for modal/dropdown components
Object.assign(window, { React: { createPortal } });

hydrateRoot(document.querySelector("#root")!, <Router />);
