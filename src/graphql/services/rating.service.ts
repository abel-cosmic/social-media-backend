import { ErrorCodes } from "../../types/error";
import { logger } from "../../utils/logger";
import { PrismaClient } from "@prisma/client";
import { GraphQLError } from "graphql";

/**
 * Service class for handling post rating operations and related data
 */
export class RatingService {
  /**
   * Creates an instance of RatingService
   * @param {PrismaClient} prisma - Prisma client instance for database operations
   */
  constructor(private prisma: PrismaClient) {}

  /**
   * Rates or updates a rating for a post
   * @param {string} postId - The ID of the post being rated
   * @param {string} userId - The ID of the user submitting the rating
   * @param {number} value - The rating value (1-5)
   * @returns {Promise<Rating>} The created or updated rating object
   * @throws {GraphQLError} When:
   *   - Rating value is invalid (BAD_USER_INPUT)
   *   - Post doesn't exist (NOT_FOUND)
   */
  async ratePost(postId: string, userId: string, value: number) {
    // Validate rating value is within allowed range
    if (value < 1 || value > 5) {
      throw new GraphQLError("Rating must be between 1 and 5", {
        extensions: { code: ErrorCodes.BAD_USER_INPUT },
      });
    }

    // Verify the post exists
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new GraphQLError("Post not found", {
        extensions: { code: ErrorCodes.NOT_FOUND },
      });
    }

    // Check for existing rating by this user
    const existingRating = await this.prisma.rating.findFirst({
      where: {
        userId,
        postId,
      },
    });

    if (existingRating) {
      // Update existing rating if found
      const updatedRating = await this.prisma.rating.update({
        where: { id: existingRating.id },
        data: { value },
      });

      logger.info(
        `Rating updated for post: ${postId} by user: ${userId}, value: ${value}`
      );
      return updatedRating;
    }

    // Create new rating if none exists
    const rating = await this.prisma.rating.create({
      data: {
        userId,
        postId,
        value,
      },
    });

    logger.info(`Post rated: ${postId} by user: ${userId}, value: ${value}`);
    return rating;
  }

  /**
   * Retrieves the user associated with a rating
   * @param {string} userId - The ID of the user who created the rating
   * @returns {Promise<User|null>} The user object or null if not found
   */
  async getUserForRating(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  /**
   * Retrieves the post associated with a rating
   * @param {string} postId - The ID of the post that was rated
   * @returns {Promise<Post|null>} The post object or null if not found
   */
  async getPostForRating(postId: string) {
    return this.prisma.post.findUnique({
      where: { id: postId },
    });
  }
}