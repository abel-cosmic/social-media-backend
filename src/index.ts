import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { schema } from "./graphql/schema";
import { ErrorHandler } from "./middleware/error-handler.middleware";
import { JwtUtils } from "./utils/jwt";
import { logger } from "./utils/logger";
import { config } from "./config/env";
import { ErrorCodes } from "./types/error";

dotenv.config();

export const prisma = new PrismaClient({
  log: [
    { level: "warn", emit: "event" },
    { level: "error", emit: "event" },
  ],
});

prisma.$on("warn", (e) => {
  logger.warn("Prisma Warning", { message: e.message });
});

prisma.$on("error", (e) => {
  logger.error("Prisma Error", { message: e.message });
});

async function startServer() {
  const server = new ApolloServer({
    schema,
    formatError: (formattedError) => {
      const error = ErrorHandler.handle(formattedError);
      if (error.extensions?.statusCode === 500) {
        logger.error("Server Error", {
          message: error.message,
          path: error.path,
          code: error.extensions.code,
          stack: config.nodeEnv === "development" ? error.stack : undefined,
        });
      } else {
        logger.warn("Client Error", {
          message: error.message,
          path: error.path,
          code: error.extensions?.code,
        });
      }

      if (config.nodeEnv === "production") {
        return {
          message: error.message,
          extensions: {
            code: error.extensions?.code || ErrorCodes.INTERNAL_SERVER_ERROR,
          },
        };
      }

      return error;
    },
    plugins: [
      {
        async requestDidStart() {
          return {
            async didEncounterErrors(requestContext) {
              if (requestContext.errors?.length) {
                logger.error("Request Errors", {
                  errors: requestContext.errors.map((err) => ({
                    message: err.message,
                    path: err.path,
                    code: err.extensions?.code,
                  })),
                  operation: requestContext.operation?.operation,
                  query: requestContext.request.query,
                });
              }
            },
          };
        },
      },
    ],
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: config.port },
    context: async ({ req }) => {
      const token = req.headers.authorization?.split(" ")[1] || "";
      let user = null;

      if (token) {
        try {
          const decoded = JwtUtils.verifyToken(token);
          if (!decoded.userId) {
            throw new Error("Invalid token payload");
          }
          user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, username: true, email: true, role: true },
          });

          if (!user) {
            logger.warn("User not found for valid token", {
              userId: decoded.userId,
            });
          }
        } catch (error) {
          logger.warn("Invalid authentication token", { error });
        }
      }

      return {
        prisma,
        user,
        requestId: req.headers["x-request-id"] || crypto.randomUUID(),
      };
    },
  });

  logger.info(`🚀 Server ready at ${url}`);
  return { server, url };
}

const shutdown = async () => {
  logger.info("Shutting down server...");
  try {
    await prisma.$disconnect();
    logger.info("Prisma disconnected");
    process.exit(0);
  } catch (error) {
    logger.error("Error during shutdown", { error });
    process.exit(1);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

startServer().catch((error) => {
  logger.error("Failed to start server", { error });
  process.exit(1);
});
