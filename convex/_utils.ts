/**
 * Shared Convex auth utilities to avoid duplication across modules.
 */

/**
 * Extracts the user's role from a Convex identity object via publicMetadata.
 * Returns undefined if identity is missing or does not carry a role string.
 */
export function getRole(identity: unknown): string | undefined {
  if (typeof identity !== "object" || identity === null) {
    return undefined;
  }

  const metadata = Reflect.get(identity, "publicMetadata");
  if (typeof metadata !== "object" || metadata === null) {
    return undefined;
  }

  const role = Reflect.get(metadata, "role");
  return typeof role === "string" ? role : undefined;
}
