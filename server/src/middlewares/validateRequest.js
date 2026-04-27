// ============================================================
// middlewares/validateRequest.js
// Runs express-validator chains and collects errors.
// Must be placed AFTER the validator array in the route, e.g.:
//
//   router.post(
//     '/register',
//     validateRegister,          // array of body() chains
//     validateRequest,           // this middleware — collects errors
//     register                   // controller — only runs if no errors
//   )
//
// On failure: responds 422 with structured field errors so the
// frontend can map them directly onto form fields.
// ============================================================

import { validationResult } from 'express-validator';
import { ApiError }         from '../utils/apiError.js';

const validateRequest = (req, res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next(); // no errors — proceed to controller
  }

  // Map to  [{ field: 'email', message: 'Invalid email address' }]
  const errors = result.array().map((err) => ({
    field:   err.path ?? err.param, // express-validator v7 uses 'path', v6 uses 'param'
    message: err.msg,
  }));

  // Use ApiError so errorHandler formats it consistently.
  // Pass errors array as third argument — it's included in the response.
  return next(new ApiError(422, 'Validation failed', errors));
};

// ── validate(schema) ─────────────────────────────────────────
// Higher-order function used by routes as:
//   validate(registerSchema)
// Returns an array: [...schemaChains, validateRequest]
// so Express runs validation chains then checks for errors.
export const validate = (schema) => [...schema, validateRequest];

export default validateRequest;