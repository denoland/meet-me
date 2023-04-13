import { serve } from "aleph/server";
import react from "aleph/plugins/react";
import unocss from "aleph/plugins/unocss";
import config from "./unocss.config.ts";


import routes from "./routes/_export.ts";



serve({
  plugins: [
    react({ ssr: false }),
    unocss(config),
  ],
  router:{
    routes,
    glob: "./routes/**/*.{ts,tsx}",
	  
  }

});
