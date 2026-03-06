import { ZodError } from 'zod';
import { ValidationError } from './errors';

/**
 * Handle validation errors and convert to ValidationError
 * @param error - Unknown error from try-catch
 * @returns ValidationError or original Error
 */
export function handleValidationError(error: unknown): Error {
  if (error instanceof ZodError) {
    const validationError = new ValidationError(
      'Data validation failed',
      error,
    );

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🔴 Validation Error:', {
        errors: error.errors,
        formatted: validationError.getUserFriendlyMessages(),
      });
    }

    return validationError;
  }

  // Return original error if not a ZodError
  return error instanceof Error ? error : new Error(String(error));
}

/**
 * Safe parse with error handling
 * @param schema - Zod schema
 * @param data - Data to validate
 * @returns Validated data or throws ValidationError
 */
export function safeParse<T>(
  schema: { parse: (data: unknown) => T },
  data: unknown,
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    throw handleValidationError(error);
  }
}

/**
 * Validate and return result without throwing
 * @param schema - Zod schema
 * @param data - Data to validate
 * @returns Object with success flag and data or error
 */
export function validateSafe<T>(
  schema: { safeParse: (data: unknown) => { success: boolean; data?: T; error?: ZodError } },
  data: unknown,
): { success: true; data: T } | { success: false; error: ValidationError } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data as T };
  }
  
  return {
    success: false,
    error: new ValidationError('Validation failed', result.error as ZodError),
  };
}
