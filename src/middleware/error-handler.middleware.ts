import { ErrorCodes, ServiceError } from "../types/error";
import { logger } from "../utils/logger";
import { GraphQLError } from "graphql";

export class ErrorHandler {
  static handle(error: unknown): GraphQLError {
    // Handle known service errors
    if (error instanceof ServiceError) {
      logger.warn(`Service error: ${error.message}`, {
        code: error.code,
        details: error.details,
      });

      return new GraphQLError(error.message, {
        extensions: {
          code: error.code,
          statusCode: error.statusCode,
          details: error.details,
        },
      });
    }

    // Handle Prisma errors
    if (
      error instanceof Error &&
      error.name === "PrismaClientKnownRequestError"
    ) {
      logger.error("Database error", { error });

      // Handle unique constraint violations
      if (error.message.includes("Unique constraint failed")) {
        return new GraphQLError("Resource already exists", {
          extensions: {
            code: ErrorCodes.CONFLICT,
            statusCode: 409,
          },
        });
      }

      // Handle not found errors
      if (error.message.includes("Record to update not found")) {
        return new GraphQLError("Resource not found", {
          extensions: {
            code: ErrorCodes.NOT_FOUND,
            statusCode: 404,
          },
        });
      }
    }

    // Handle validation errors (e.g., from class-validator)
    if (error instanceof Error && error.name === "ValidationError") {
      logger.warn("Validation error", { error });
      return new GraphQLError("Validation failed", {
        extensions: {
          code: ErrorCodes.BAD_USER_INPUT,
          statusCode: 400,
          details: error.message,
        },
      });
    }

    // Fallback for unexpected errors
    logger.error("Unexpected error", { error });
    return new GraphQLError("Internal server error", {
      extensions: {
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
        statusCode: 500,
      },
    });
  }

  static async withErrorHandling<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      throw this.handle(error);
    }
  }
}
