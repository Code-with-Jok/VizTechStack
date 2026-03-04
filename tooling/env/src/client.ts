import { z } from "zod";

/**
 * Client-side (public) environment variables.
 * Only NEXT_PUBLIC_* vars should be here — these are safe to expose to the browser.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_CONVEX_URL: z
    .string()
    .url("NEXT_PUBLIC_CONVEX_URL must be a valid URL")
    .optional(),
  NEXT_PUBLIC_API_URL: z
    .string()
    .url("NEXT_PUBLIC_API_URL must be a valid URL")
    .optional(),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

function createClientEnv(): ClientEnv {
  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  });

  if (!parsed.success) {
    console.error(
      "❌ Invalid client environment variables:",
      parsed.error.flatten().fieldErrors
    );
    throw new Error("Invalid client environment variables");
  }

  return parsed.data;
}

let cachedClientEnv: ClientEnv | null = null;

function getClientEnv(): ClientEnv {
  if (!cachedClientEnv) {
    cachedClientEnv = createClientEnv();
  }
  return cachedClientEnv;
}

/**
 * Validated client (public) environment variables.
 * Safe to use in browser code.
 */
export const clientEnv = {
  get NEXT_PUBLIC_CONVEX_URL() {
    return getClientEnv().NEXT_PUBLIC_CONVEX_URL;
  },
  get NEXT_PUBLIC_API_URL() {
    return getClientEnv().NEXT_PUBLIC_API_URL;
  },
};
