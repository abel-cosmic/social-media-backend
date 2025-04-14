import jwt, { SignOptions } from "jsonwebtoken";
import { logger } from "./logger";
import { config } from "../config/env";

interface JwtPayload {
  userId: string;
  username?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

type TokenOptions = SignOptions & {
  issuer?: string;
  audience?: string;
};

export class JwtUtils {
  private static defaultOptions = {
    expiresIn: process.env.JWT_EXPIRES_IN ?? "1hr",
    issuer: config.jwtIssuer || "social-media-api",
    audience: config.jwtAudience || "social-media-app",
    algorithm: "HS256",
  };

  static generateToken(
    payload: Omit<JwtPayload, "iat" | "exp">,
    options: TokenOptions = {}
  ): string {
    if (!config.jwtSecret) {
      throw new Error("JWT_SECRET is not configured");
    }

    // Type assertion needed for expiresIn string format
    const signOptions: SignOptions = {
      ...this.defaultOptions,
      ...options,
    } as SignOptions;

    return jwt.sign(payload, config.jwtSecret, signOptions);
  }

  static verifyToken(token: string): JwtPayload {
    if (!config.jwtSecret) {
      throw new Error("JWT_SECRET is not configured");
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret, {
        algorithms: ["HS256"],
        issuer: this.defaultOptions.issuer,
        audience: this.defaultOptions.audience,
      });

      if (typeof decoded === "string" || !decoded) {
        throw new Error("Invalid token format");
      }

      if (!("userId" in decoded)) {
        throw new Error("Token payload missing required fields");
      }

      return decoded as JwtPayload;
    } catch (error) {
      logger.error("Token verification failed", error);
      throw error;
    }
  }

  static decodeToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.decode(token, { complete: false });

      if (!decoded || typeof decoded === "string") {
        return null;
      }

      if (!("userId" in decoded)) {
        return null;
      }

      return decoded as JwtPayload;
    } catch (error) {
      logger.error("Error decoding token", error);
      return null;
    }
  }

  static refreshToken(token: string, newExpiry?:any): string {
    const decoded = this.verifyToken(token);
    return this.generateToken(
      {
        userId: decoded.userId,
        username: decoded.username,
        role: decoded.role,
      },
      { expiresIn: newExpiry || this.defaultOptions.expiresIn }
    );
  }
}