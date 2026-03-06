export * from "./generated/graphql-zod";

export function validateOrThrow<T>(
  operationName: string,
  schema: any,
  payload: any,
): T {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new Error(
      `RuntimeValidationError in ${operationName}: ${result.error.message}`,
    );
  }
  return result.data as T;
}
