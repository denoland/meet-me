// Imports route modules for serverless env that doesn't support the dynamic import.
// This module will be updated automaticlly in develoment mode, do NOT edit it manually.

import * as $0 from "./_app.tsx";
import * as $1 from "./index.tsx";
import * as $2 from "./terms.tsx";
import * as $3 from "./privacy.tsx";
import * as $4 from "./mypage/settings.tsx";
import * as $5 from "./mypage/index.tsx";
import * as $6 from "./mypage/onboarding.tsx";
import * as $7 from "./api/authorize.ts";
import * as $8 from "./api/user.ts";
import * as $9 from "./$user/index.tsx";
import * as $10 from "./$user/$event_type.tsx";

export default {
  "/_app": $0,
  "/": $1,
  "/terms": $2,
  "/privacy": $3,
  "/mypage/settings": $4,
  "/mypage/index": $5,
  "/mypage/onboarding": $6,
  "/api/authorize": $7,
  "/api/user": $8,
  "/:user/index": $9,
  "/:user/:event_type": $10,
};
