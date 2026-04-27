// ============================================================
// utils/apiResponse.js
// Standardised success response wrapper.
// Usage: res.json(new ApiResponse(200, { user }, 'User fetched'))
// ============================================================

export class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.success    = statusCode < 400;
    this.message    = message;
    this.data       = data;
  }
}