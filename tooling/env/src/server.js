"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverEnv = void 0;
var zod_1 = require("zod");
/**
 * Server-side environment variables.
 * These MUST NOT be exposed to the frontend.
 * The schema validates at runtime — if any var is missing, the app crashes early.
 */
var serverEnvSchema = zod_1.z.object({
    // Convex
    CONVEX_DEPLOYMENT: zod_1.z.string().min(1, "CONVEX_DEPLOYMENT is required"),
    CONVEX_URL: zod_1.z.string().url("CONVEX_URL must be a valid URL"),
    // Server
    PORT: zod_1.z.coerce.number().default(4000),
    NODE_ENV: zod_1.z
        .enum(["development", "production", "test"])
        .default("development"),
});
function createServerEnv() {
    var parsed = serverEnvSchema.safeParse(process.env);
    if (!parsed.success) {
        console.error("❌ Invalid server environment variables:", parsed.error.flatten().fieldErrors);
        throw new Error("Invalid server environment variables");
    }
    return parsed.data;
}
/**
 * Validated server environment variables.
 * Access via `serverEnv.CONVEX_URL` etc.
 * Will throw at import time if any required var is missing.
 */
exports.serverEnv = createServerEnv();
