import { z } from "zod";

/**
 * Server-side environment variables.
 * These MUST NOT be exposed to the frontend.
 * The schema validates at runtime — if any var is missing, the app crashes early.
 */
const serverEnvSchema = z.object({
  // Convex
  CONVEX_DEPLOYMENT: z.string().min(1, "CONVEX_DEPLOYMENT is required"),
  CONVEX_URL: z.string().url("CONVEX_URL must be a valid URL"),

  // Server
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  WEB_APP_ORIGIN: z.string().url().default("http://localhost:3000"),
  CLERK_JWT_ISSUER_DOMAIN: z
    .string()
    .url("CLERK_JWT_ISSUER_DOMAIN must be a valid URL"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

function createServerEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error(
      "❌ Invalid server environment variables:",
      parsed.error.flatten().fieldErrors
    );
    throw new Error("Invalid server environment variables");
  }

  return parsed.data;
}

let cachedServerEnv: ServerEnv | null = null;

/**
 * Validated server environment variables.
 * Access via `serverEnv.CONVEX_URL` etc.
 * Will throw on first access if any required var is missing.
 */
export const serverEnv = {
  get CONVEX_DEPLOYMENT() {
    return getServerEnv().CONVEX_DEPLOYMENT;
  },
  get CONVEX_URL() {
    return getServerEnv().CONVEX_URL;
  },
  get PORT() {
    return getServerEnv().PORT;
  },
  get NODE_ENV() {
    return getServerEnv().NODE_ENV;
  },
  get WEB_APP_ORIGIN() {
    return getServerEnv().WEB_APP_ORIGIN;
  },
  get CLERK_JWT_ISSUER_DOMAIN() {
    return getServerEnv().CLERK_JWT_ISSUER_DOMAIN;
  },
};

function getServerEnv(): ServerEnv {
  if (!cachedServerEnv) {
    cachedServerEnv = createServerEnv();
  }
  return cachedServerEnv;
}
