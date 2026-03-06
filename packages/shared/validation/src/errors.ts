import { ZodError } from 'zod';

/**
 * Custom error class for validation failures
 * Wraps ZodError with additional utilities
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly zodError: ZodError,
  ) {
    super(message);
    this.name = 'ValidationError';
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }

  /**
   * Get user-friendly error messages
   * @returns Array of formatted error messages
   */
  getUserFriendlyMessages(): string[] {
    return this.zodError.errors.map((err) => {
      const path = err.path.join('.');
      return path ? `${path}: ${err.message}` : err.message;
    });
  }

  /**
   * Get field-specific errors for forms
   * @returns Object mapping field paths to error messages
   */
  getFieldErrors(): Record<string, string[]> {
    const fieldErrors: Record<string, string[]> = {};

    for (const err of this.zodError.errors) {
      const field = err.path.join('.');
      if (!fieldErrors[field]) {
        fieldErrors[field] = [];
      }
      fieldErrors[field].push(err.message);
    }

    return fieldErrors;
  }

  /**
   * Get first error message (useful for simple error display)
   * @returns First error message or generic message
   */
  getFirstError(): string {
    const messages = this.getUserFriendlyMessages();
    return messages[0] || 'Validation failed';
  }

  /**
   * Convert to JSON for logging/debugging
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      errors: this.zodError.errors,
      fieldErrors: this.getFieldErrors(),
    };
  }
}
