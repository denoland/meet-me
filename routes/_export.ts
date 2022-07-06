// Imports route modules for serverless env that doesn't support the dynamic import.
// This module will be updated automaticlly in develoment mode, do NOT edit it manually.

import * as $0 from "./_app.tsx";
import * as $1 from "./index.tsx";
import * as $2 from "./terms.tsx";
import * as $3 from "./privacy.tsx";
import * as $4 from "./signout.tsx";
import * as $5 from "./mypage/settings.tsx";
import * as $6 from "./mypage/index.tsx";
import * as $7 from "./mypage/onboarding.tsx";
import * as $8 from "./api/authorize.ts";
import * as $9 from "./api/user.ts";
import * as $10 from "./$user/index.tsx";
import * as $11 from "./$user/$event_type.tsx";

export default {
  "/_app": $0,
  "/": $1,
  "/terms": $2,
  "/privacy": $3,
  "/signout": $4,
  "/mypage/settings": $5,
  "/mypage/index": $6,
  "/mypage/onboarding": $7,
  "/api/authorize": $8,
  "/api/user": $9,
  "/:user/index": $10,
  "/:user/:event_type": $11,
};
