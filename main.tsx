// Copyright 2022 the Deno authors. All rights reserved. MIT license.
// The frontend entrypoint

import { createPortal } from "react-dom";
import { hydrateRoot } from "react-dom/client";
import { Router } from "aleph/react";

// for modal/dropdown components
Object.assign(window, { React: { createPortal } });

const mountPoint = document.querySelector("#root")!;
hydrateRoot(mountPoint, <Router createPortal={createPortal} />);
