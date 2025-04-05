// src/tests/test-utils.ts
import { PrismaClient } from "@prisma/client";
import { ApolloServer } from "@apollo/server";
import { schema } from "../graphql/schema";
import { Context } from "../types/context";

// Create a test Prisma client instance
const testPrisma = new PrismaClient();

// Create mock context with optional user
export const mockContext = (user?: any): Context => ({
  prisma: testPrisma,
  user: user || null,
});

// Create a test server
export const createTestServer = () => {
  const server = new ApolloServer<Context>({ schema });

  // Execute operation helper
  const executeOperation = async ({
    query,
    variables = {},
    context = mockContext(),
  }: {
    query: string;
    variables?: Record<string, any>;
    context?: Context;
  }) => {
    return server.executeOperation(
      {
        query,
        variables,
      },
      {
        contextValue: context,
      }
    );
  };

  return {
    server,
    prisma: testPrisma,
    executeOperation,
  };
};

// Database cleanup helper using Prisma's deleteMany
export const cleanupDatabase = async () => {
  // Delete in proper order to respect foreign key constraints
  await testPrisma.rating.deleteMany();
  await testPrisma.like.deleteMany();
  await testPrisma.comment.deleteMany();
  await testPrisma.post.deleteMany();
  await testPrisma.user.deleteMany();
};

// Test lifecycle management
beforeAll(async () => {
  await cleanupDatabase();
});

afterAll(async () => {
  await testPrisma.$disconnect();
});

afterEach(async () => {
  await cleanupDatabase();
});