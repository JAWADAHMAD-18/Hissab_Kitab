export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 72;

/**
 * Validates a password against the project's policy.
 * Returns an error message string if invalid, or null if valid.
 */
export function validatePassword(pw: unknown): string | null {
  if (!pw || typeof pw !== "string") {
    return "Password is required";
  }

  if (pw.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`;
  }

  if (pw.length > MAX_PASSWORD_LENGTH) {
    return `Password cannot exceed ${MAX_PASSWORD_LENGTH} characters`;
  }

  return null;
}
