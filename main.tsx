// Copyright 2022 the Deno authors. All rights reserved. MIT license.

import { createPortal } from "react-dom";
import { hydrateRoot } from "react-dom/client";
import { Router } from "aleph/react";

const mountPoint = document.querySelector("#root")!
hydrateRoot(mountPoint, <Router createPortal={createPortal} />);
