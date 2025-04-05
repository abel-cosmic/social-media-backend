import { ErrorCodes } from "../../types/error";
import { logger } from "../../utils/logger";
import { PrismaClient } from "@prisma/client";
import { GraphQLError } from "graphql";

/**
 * Service class for handling like-related operations
 */
export class LikeService {
  /**
   * Creates an instance of LikeService
   * @param {PrismaClient} prisma - Prisma client instance
   */
  constructor(private prisma: PrismaClient) {}

  /**
   * Adds a like to a post by a user
   * @param {string} postId - The ID of the post to like
   * @param {string} userId - The ID of the user liking the post
   * @returns {Promise<Like>} The created or existing like object
   * @throws {GraphQLError} If post is not found (NOT_FOUND error code)
   */
  async likePost(postId: string, userId: string) {
    // Verify post exists
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new GraphQLError("Post not found", {
        extensions: { code: ErrorCodes.NOT_FOUND },
      });
    }

    // Check for existing like
    const existingLike = await this.prisma.like.findFirst({
      where: {
        userId,
        postId,
      },
    });

    // Return existing like if found
    if (existingLike) {
      return existingLike;
    }

    // Create new like
    const like = await this.prisma.like.create({
      data: {
        userId,
        postId,
      },
    });

    logger.info(`Post liked: ${postId} by user: ${userId}`);
    return like;
  }

  /**
   * Removes a like from a post by a user
   * @param {string} postId - The ID of the post to unlike
   * @param {string} userId - The ID of the user unliking the post
   * @returns {Promise<boolean>} True if the like was successfully removed
   * @throws {GraphQLError} If like is not found (NOT_FOUND error code)
   */
  async unlikePost(postId: string, userId: string) {
    // Find existing like
    const like = await this.prisma.like.findFirst({
      where: {
        userId,
        postId,
      },
    });

    if (!like) {
      throw new GraphQLError("Like not found", {
        extensions: { code: ErrorCodes.NOT_FOUND },
      });
    }

    // Delete the like
    await this.prisma.like.delete({
      where: { id: like.id },
    });

    logger.info(`Post unliked: ${postId} by user: ${userId}`);
    return true;
  }

  /**
   * Gets the user who created a like
   * @param {string} userId - The ID of the user to retrieve
   * @returns {Promise<User | null>} The user who created the like
   */
  async getUserForLike(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  /**
   * Gets the post that was liked
   * @param {string} postId - The ID of the post to retrieve
   * @returns {Promise<Post | null>} The post that was liked
   */
  async getPostForLike(postId: string) {
    return this.prisma.post.findUnique({
      where: { id: postId },
    });
  }
}