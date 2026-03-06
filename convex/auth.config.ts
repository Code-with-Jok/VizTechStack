const fallbackIssuerDomain = "https://dummy.clerk.accounts.dev";
const issuerDomain =
  process.env.CLERK_JWT_ISSUER_DOMAIN ?? fallbackIssuerDomain;

export default {
  providers: [
    {
      domain: issuerDomain,
      applicationID: "convex",
    },
  ],
};
