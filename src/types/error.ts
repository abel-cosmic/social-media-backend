export const ErrorCodes = {
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  UNAUTHENTICATED: "UNAUTHENTICATED",
  CONFLICT: "CONFLICT",
  BAD_USER_INPUT: "BAD_USER_INPUT",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
};

export class ServiceError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends ServiceError {
  constructor(resource: string, details?: any) {
    super(`${resource} not found`, ErrorCodes.NOT_FOUND, 404, details);
  }
}

export class ValidationError extends ServiceError {
  constructor(message: string, details?: any) {
    super(message, ErrorCodes.VALIDATION_ERROR, 400, details);
  }
}

export class AuthorizationError extends ServiceError {
  constructor(message = "Not authorized") {
    super(message, ErrorCodes.UNAUTHORIZED, 403);
  }
}

export class AuthenticationError extends ServiceError {
  constructor(message = "Not authenticated") {
    super(message, ErrorCodes.UNAUTHENTICATED, 401);
  }
}

export class ConflictError extends ServiceError {
  constructor(message: string, details?: any) {
    super(message, ErrorCodes.CONFLICT, 409, details);
  }
}

export class RateLimitError extends ServiceError {
  constructor(message = "Too many requests") {
    super(message, ErrorCodes.RATE_LIMIT_EXCEEDED, 429);
  }
}

export class InternalServerError extends ServiceError {
  constructor(message = "Internal server error") {
    super(message, ErrorCodes.INTERNAL_SERVER_ERROR, 500);
  }
}
