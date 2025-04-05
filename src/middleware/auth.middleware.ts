import { Context } from "../types/context";
import { GraphQLError } from "graphql";
import { ErrorCodes } from "../types/error";

export class AuthMiddleware {
  static authenticate(context: Context) {
    if (!context.user) {
      throw new GraphQLError("Not authenticated", {
        extensions: { code: ErrorCodes.UNAUTHENTICATED },
      });
    }
    return context.user;
  }

  static authorize(userId: string, resourceUserId: string, role?: string) {
    if (userId !== resourceUserId && role !== "ADMIN") {
      throw new GraphQLError("Not authorized", {
        extensions: { code: ErrorCodes.UNAUTHORIZED },
      });
    }
  }

  static isAdmin(context: Context) {
    const user = this.authenticate(context);
    if (user.role !== "ADMIN") {
      throw new GraphQLError("Admin access required", {
        extensions: { code: ErrorCodes.UNAUTHORIZED },
      });
    }
    return user;
  }
}
