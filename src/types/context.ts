import { PrismaClient } from "@prisma/client";

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface Context {
  prisma: PrismaClient;
  user: User | null;
}
