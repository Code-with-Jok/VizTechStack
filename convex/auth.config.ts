const issuerDomain = process.env.CLERK_JWT_ISSUER_DOMAIN;

if (!issuerDomain && process.env.NODE_ENV === "production") {
  throw new Error(
    "CLERK_JWT_ISSUER_DOMAIN is required in production. " +
      "Set this environment variable before starting the server."
  );
}

export default {
  providers: [
    {
      domain: issuerDomain ?? "https://dummy.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
