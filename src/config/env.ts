import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV ,
  jwtSecret: process.env.JWT_SECRET ,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1hr" ,
  jwtIssuer: process.env.JWT_ISSUER,
  jwtAudience: process.env.JWT_AUDIENCE,
  databaseUrl:
    process.env.DATABASE_URL,
  mysqlRootPassword: process.env.MYSQL_ROOT_PASSWORD,
  databaseUser: process.env.DATABASE_USER ,
  databasePassword: process.env.DATABASE_PASSWORD,
  databaseName: process.env.DATABASE_NAME ,
  databaseHost:
    process.env.DATABASE_HOST ,
  databasePort: Number(process.env.DATABASE_PORT),
  appUrl: process.env.APP_URL,
  corsOrigin: process.env.CORS_ORIGIN ,
  refreshTokenSecret:
    process.env.REFRESH_TOKEN_SECRET ,
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  rateLimitWindow: Number(process.env.RATE_LIMIT_WINDOW) || 15,
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 100,
  maxFileSize: Number(process.env.MAX_FILE_SIZE) || 10,
  allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(",")
    .map((type) => type.trim())
    .filter((type) => type) || [
    "image/jpeg",
    "image/png",
    "image/gif",
    "video/mp4",
  ],
  smtpHost: process.env.SMTP_HOST,
  smtpPort: Number(process.env.SMTP_PORT) ,
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS ,
  emailFrom: process.env.EMAIL_FROM,

  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
  isTest: process.env.NODE_ENV === "test",
};
