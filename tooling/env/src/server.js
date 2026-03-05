"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverEnv = void 0;
const zod_1 = require("zod");
/**
 * Server-side environment variables.
 * These MUST NOT be exposed to the frontend.
 * The schema validates at runtime — if any var is missing, the app crashes early.
 */
const serverEnvSchema = zod_1.z.object({
    // Convex
    CONVEX_DEPLOYMENT: zod_1.z.string().min(1, "CONVEX_DEPLOYMENT is required"),
    CONVEX_URL: zod_1.z.string().url("CONVEX_URL must be a valid URL"),
    // Server
    PORT: zod_1.z.coerce.number().int().min(1).max(65535).default(4000),
    NODE_ENV: zod_1.z
        .enum(["development", "production", "test"])
        .default("development"),
    WEB_APP_ORIGIN: zod_1.z.string().url().default("http://localhost:3000"),
    CLERK_JWT_ISSUER_DOMAIN: zod_1.z
        .string()
        .url("CLERK_JWT_ISSUER_DOMAIN must be a valid URL"),
});
function createServerEnv() {
    const parsed = serverEnvSchema.safeParse(process.env);
    if (!parsed.success) {
        const fieldErrors = parsed.error.flatten().fieldErrors;
        console.error("❌ Invalid server environment variables:");
        Object.entries(fieldErrors).forEach(([field, errors]) => {
            console.error(`  - ${field}: ${errors?.join(", ")}`);
        });
        throw new Error(`Invalid server environment variables: ${Object.keys(fieldErrors).join(", ")}`);
    }
    return parsed.data;
}
let cachedServerEnv = null;
/**
 * Validated server environment variables.
 * Access via `serverEnv.CONVEX_URL` etc.
 * Will throw on first access if any required var is missing.
 */
exports.serverEnv = {
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
function getServerEnv() {
    if (!cachedServerEnv) {
        cachedServerEnv = createServerEnv();
    }
    return cachedServerEnv;
}
//# sourceMappingURL=server.js.map