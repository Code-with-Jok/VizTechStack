import { z } from "zod";
/**
 * Server-side environment variables.
 * These MUST NOT be exposed to the frontend.
 * The schema validates at runtime — if any var is missing, the app crashes early.
 */
declare const serverEnvSchema: z.ZodObject<{
    CONVEX_DEPLOYMENT: z.ZodString;
    CONVEX_URL: z.ZodString;
    PORT: z.ZodDefault<z.ZodNumber>;
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>;
    WEB_APP_ORIGIN: z.ZodDefault<z.ZodString>;
    CLERK_JWT_ISSUER_DOMAIN: z.ZodString;
}, "strip", z.ZodTypeAny, {
    CONVEX_DEPLOYMENT: string;
    CONVEX_URL: string;
    PORT: number;
    NODE_ENV: "development" | "production" | "test";
    WEB_APP_ORIGIN: string;
    CLERK_JWT_ISSUER_DOMAIN: string;
}, {
    CONVEX_DEPLOYMENT: string;
    CONVEX_URL: string;
    CLERK_JWT_ISSUER_DOMAIN: string;
    PORT?: number | undefined;
    NODE_ENV?: "development" | "production" | "test" | undefined;
    WEB_APP_ORIGIN?: string | undefined;
}>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;
/**
 * Validated server environment variables.
 * Access via `serverEnv.CONVEX_URL` etc.
 * Will throw on first access if any required var is missing.
 */
export declare const serverEnv: {
    readonly CONVEX_DEPLOYMENT: string;
    readonly CONVEX_URL: string;
    readonly PORT: number;
    readonly NODE_ENV: "development" | "production" | "test";
    readonly WEB_APP_ORIGIN: string;
    readonly CLERK_JWT_ISSUER_DOMAIN: string;
};
export {};
//# sourceMappingURL=server.d.ts.map