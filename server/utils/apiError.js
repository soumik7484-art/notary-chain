class ApiError extends Error {
  constructor(m, s) { super(m); this.statusCode = s; this.isOperational = true; Error.captureStackTrace(this, this.constructor); }
}
class BadRequestError extends ApiError { constructor(m = 'Bad Request') { super(m, 400); } }
class UnauthorizedError extends ApiError { constructor(m = 'Unauthorized') { super(m, 401); } }
class ForbiddenError extends ApiError { constructor(m = 'Forbidden') { super(m, 403); } }
class NotFoundError extends ApiError { constructor(m = 'Not Found') { super(m, 404); } }
class ConflictError extends ApiError { constructor(m = 'Conflict') { super(m, 409); } }
class ValidationError extends ApiError { constructor(m = 'Validation Error', e) { super(m, 422); this.errors = e; } }
class TooManyRequestsError extends ApiError { constructor(m = 'Too Many Requests') { super(m, 429); } }
class InternalError extends ApiError { constructor(m = 'Internal Server Error') { super(m, 500); } }

module.exports = { ApiError, BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, ValidationError, TooManyRequestsError, InternalError };
