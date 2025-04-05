import jwt from "jsonwebtoken";
import { logger } from "./logger";
import { config } from "../config/env";

interface JwtPayload {
  userId: string;
  username?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

interface TokenOptions {
  expiresIn?: string;
  issuer?: string;
  audience?: string;
}

export class JwtUtils {
  private static readonly defaultOptions: TokenOptions = {
    expiresIn: config.jwtExpiresIn || "7d",
    issuer: config.jwtIssuer || "your-app-name",
    audience: config.jwtAudience || "your-app-client",
  };

  static generateToken(
    payload: Omit<JwtPayload, "iat" | "exp">,
    options: TokenOptions = {}
  ): string {
    try {
      const mergedOptions = { ...this.defaultOptions, ...options };
      //@ts-ignore
      return jwt.sign(payload, config.jwtSecret, {
        expiresIn: mergedOptions.expiresIn,
        issuer: mergedOptions.issuer,
        audience: mergedOptions.audience,
        algorithm: "HS256",
      });
    } catch (error) {
      logger.error("Error generating JWT token", {
        error,
        userId: payload.userId,
      });
      throw new Error("Failed to generate authentication token");
    }
  }

  static verifyToken(token: string): JwtPayload {
    try {
      if (!token) {
        throw new Error("No token provided");
      }

      return jwt.verify(token, config.jwtSecret, {
        algorithms: ["HS256"],
        issuer: this.defaultOptions.issuer,
        audience: this.defaultOptions.audience,
      }) as JwtPayload;
    } catch (error) {
      logger.error("JWT verification failed", { error });

      // Handle specific JWT errors
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Authentication token expired");
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid authentication token");
      }

      throw new Error("Authentication verification failed");
    }
  }

  static decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch (error) {
      logger.warn("JWT decode failed", { error });
      return null;
    }
  }


  static refreshToken(token: string, newExpiry?: string): string {
    try {
      const payload = this.verifyToken(token);
      return this.generateToken(
        {
          userId: payload.userId,
          username: payload.username,
          role: payload.role,
        },
        { expiresIn: newExpiry || this.defaultOptions.expiresIn }
      );
    } catch (error) {
      logger.error("Token refresh failed", { error });
      throw new Error("Failed to refresh token");
    }
  }
}