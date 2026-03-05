import { serverEnv } from "@viztechstack/env/server";

export default {
  providers: [
    {
      domain: serverEnv.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
