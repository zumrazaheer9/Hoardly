import { createError } from './errorHandler.js';

/**
 * Validation middleware factory for Zod schemas.
 * Formats validation errors using the What + Why + How formula.
 */
export function validate(schema) {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync(req.body);
      req.body = parsed;
      next();
    } catch (err) {
      if (err.errors && Array.isArray(err.errors)) {
        const details = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        const primaryMessage = details[0]?.message || 'Input validation failed. Please review your entries and try again.';
        const error = createError(400, primaryMessage);
        error.details = details;
        return next(error);
      }
      next(err);
    }
  };
}
