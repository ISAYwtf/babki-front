import type { StandardSchemaV1Issue } from '@tanstack/react-form';

function isStandardSchemaV1Issue(error: unknown): error is StandardSchemaV1Issue {
  return error !== null
    && error !== undefined
    && typeof error === 'object'
    && 'message' in error;
}

export function getMutationErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return undefined;
}

export function getFirstFieldError(errors: unknown[]) {
  const firstError = errors[0];

  if (typeof firstError === 'string') {
    return firstError;
  }

  if (isStandardSchemaV1Issue(firstError)) {
    return String(firstError.message);
  }

  return undefined;
}
