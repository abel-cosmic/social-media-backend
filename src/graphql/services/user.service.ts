import bcrypt from "bcryptjs";
import { ErrorCodes } from "../../types/error";
import { logger } from "../../utils/logger";
import { PrismaClient } from "@prisma/client";
import { GraphQLError } from "graphql";
import { JwtUtils } from "../../utils/jwt";

/**
 * Service class for handling user authentication, profile management,
 * and related operations
 */
export class UserService {
  /**
   * Creates an instance of UserService
   * @param {PrismaClient} prisma - Prisma client instance for database operations
   */
  constructor(private prisma: PrismaClient) {}

  /**
   * Retrieves the currently authenticated user's profile
   * @param {string} userId - The ID of the user to retrieve
   * @returns {Promise<User|null>} The user object or null if not found
   */
  async getCurrentUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  /**
   * Retrieves a user by their ID
   * @param {string} id - The ID of the user to retrieve
   * @returns {Promise<User|null>} The user object or null if not found
   */
  async getUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Retrieves all users (admin-only)
   * @param {string} requesterRole - Role of the requesting user
   * @returns {Promise<User[]>} Array of all users
   * @throws {GraphQLError} If requester is not an admin (UNAUTHORIZED)
   */
  async getAllUsers(requesterRole: string) {
    if (requesterRole !== "ADMIN") {
      throw new GraphQLError("Not authorized", {
        extensions: { code: ErrorCodes.UNAUTHORIZED },
      });
    }

    return this.prisma.user.findMany();
  }

  /**
   * Registers a new user account
   * @param {Object} input - User registration data
   * @param {string} input.username - Unique username
   * @param {string} input.email - Unique email address
   * @param {string} input.password - Plain text password (will be hashed)
   * @param {string} [input.bio] - Optional user biography
   * @param {string} [input.profilePicture] - Optional profile picture URL
   * @returns {Promise<{token: string, user: User}>} Authentication token and user data
   * @throws {GraphQLError} When:
   *   - Username or email already exists (BAD_USER_INPUT)
   */
  async registerUser(input: {
    username: string;
    email: string;
    password: string;
    bio?: string;
    profilePicture?: string;
  }) {
    const { username, email, password, bio, profilePicture } = input;

    // Check for existing user with same username or email
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      throw new GraphQLError(
        "User already exists with that username or email",
        {
          extensions: { code: ErrorCodes.BAD_USER_INPUT },
        }
      );
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user record
    const newUser = await this.prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        bio,
        profilePicture,
      },
    });

    logger.info(`User registered: ${newUser.id}`);

    // Generate JWT token for immediate authentication
    const token = JwtUtils.generateToken({
      userId: newUser.id,
      role: newUser.role,
      username: newUser.username,
    });

    return {
      token,
      user: newUser,
    };
  }

  /**
   * Authenticates a user and generates an access token
   * @param {string} email - User's email address
   * @param {string} password - User's plain text password
   * @returns {Promise<{token: string, user: User}>} Authentication token and user data
   * @throws {GraphQLError} When:
   *   - Invalid credentials (UNAUTHENTICATED)
   */
  async loginUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new GraphQLError("Invalid email or password", {
        extensions: { code: ErrorCodes.UNAUTHENTICATED },
      });
    }

    // Verify password matches hashed version
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new GraphQLError("Invalid email or password", {
        extensions: { code: ErrorCodes.UNAUTHENTICATED },
      });
    }

    logger.info(`User logged in: ${user.id}`);

    // Generate JWT token
    const token = JwtUtils.generateToken({
      userId: user.id,
      role: user.role,
      username: user.username,
    });

    return {
      token,
      user,
    };
  }

  /**
   * Updates user profile information
   * @param {string} userId - ID of the user to update
   * @param {Object} input - Fields to update
   * @returns {Promise<User>} The updated user object
   */
  async updateUser(userId: string, input: any) {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: input,
    });

    logger.info(`User updated: ${userId}`);
    return updatedUser;
  }

  /**
   * Deletes a user account
   * @param {string} userId - ID of the user to delete
   * @returns {Promise<boolean>} True if deletion was successful
   */
  async deleteUser(userId: string) {
    await this.prisma.user.delete({
      where: { id: userId },
    });

    logger.info(`User deleted: ${userId}`);
    return true;
  }

  /**
   * Retrieves all posts created by a specific user
   * @param {string} userId - ID of the user whose posts to retrieve
   * @returns {Promise<Post[]>} Array of posts in descending creation order
   */
  async getUserPosts(userId: string) {
    return this.prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }
}
