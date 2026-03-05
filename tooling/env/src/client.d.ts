import { z } from "zod";
/**
 * Client-side (public) environment variables.
 * Only NEXT_PUBLIC_* vars should be here — these are safe to expose to the browser.
 */
declare const clientEnvSchema: z.ZodObject<{
    NEXT_PUBLIC_CONVEX_URL: z.ZodOptional<z.ZodString>;
    NEXT_PUBLIC_API_URL: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    NEXT_PUBLIC_CONVEX_URL?: string | undefined;
    NEXT_PUBLIC_API_URL?: string | undefined;
}, {
    NEXT_PUBLIC_CONVEX_URL?: string | undefined;
    NEXT_PUBLIC_API_URL?: string | undefined;
}>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;
/**
 * Validated client (public) environment variables.
 * Safe to use in browser code.
 */
export declare const clientEnv: {
    readonly NEXT_PUBLIC_CONVEX_URL: string | undefined;
    readonly NEXT_PUBLIC_API_URL: string | undefined;
};
export {};
//# sourceMappingURL=client.d.ts.map