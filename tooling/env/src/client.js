"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientEnv = void 0;
var zod_1 = require("zod");
/**
 * Client-side (public) environment variables.
 * Only NEXT_PUBLIC_* vars should be here — these are safe to expose to the browser.
 */
var clientEnvSchema = zod_1.z.object({
    NEXT_PUBLIC_CONVEX_URL: zod_1.z
        .string()
        .url("NEXT_PUBLIC_CONVEX_URL must be a valid URL")
        .optional(),
    NEXT_PUBLIC_API_URL: zod_1.z.string().url().optional(),
});
function createClientEnv() {
    var parsed = clientEnvSchema.safeParse({
        NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    });
    if (!parsed.success) {
        console.error("❌ Invalid client environment variables:", parsed.error.flatten().fieldErrors);
        throw new Error("Invalid client environment variables");
    }
    return parsed.data;
}
/**
 * Validated client (public) environment variables.
 * Safe to use in browser code.
 */
exports.clientEnv = createClientEnv();
