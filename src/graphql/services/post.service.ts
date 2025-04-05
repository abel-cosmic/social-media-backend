import { PrismaClient } from "@prisma/client";
import { GraphQLError } from "graphql";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { ErrorCodes } from "../../types/error";
import { logger } from "../../utils/logger";

/**
 * Service class for handling post-related operations including CRUD,
 * comments, likes, and ratings
 */
export class PostService {
  /**
   * Creates an instance of PostService
   * @param {PrismaClient} prisma - Prisma client instance
   */
  constructor(private prisma: PrismaClient) {}

  /**
   * Retrieves a single post by its ID
   * @param {string} id - The ID of the post to retrieve
   * @returns {Promise<Post>} The requested post
   * @throws {GraphQLError} If post is not found (NOT_FOUND error code)
   */
  async getPostById(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new GraphQLError("Post not found", {
        extensions: { code: ErrorCodes.NOT_FOUND },
      });
    }

    return post;
  }

  /**
   * Retrieves all posts in descending order of creation
   * @returns {Promise<Post[]>} Array of all posts
   */
  async getAllPosts() {
    return this.prisma.post.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Retrieves all posts by a specific user
   * @param {string} userId - The ID of the user whose posts to retrieve
   * @returns {Promise<Post[]>} Array of posts by the specified user
   */
  async getUserPosts(userId: string) {
    return this.prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Creates a new post
   * @param {Object} input - Post creation data
   * @param {string} input.mediaFile - URL/path to the media file
   * @param {string} [input.caption] - Optional post caption
   * @param {string} userId - ID of the user creating the post
   * @returns {Promise<Post>} The newly created post
   */
  async createPost(
    input: { mediaFile: string; caption?: string },
    userId: string
  ) {
    const post = await this.prisma.post.create({
      data: {
        userId,
        mediaFile: input.mediaFile,
        caption: input.caption,
      },
    });

    logger.info(`Post created: ${post.id} by user: ${userId}`);
    return post;
  }

  /**
   * Updates an existing post
   * @param {string} id - ID of the post to update
   * @param {Object} input - Fields to update
   * @param {string} userId - ID of the requesting user
   * @param {string} userRole - Role of the requesting user
   * @returns {Promise<Post>} The updated post
   * @throws {GraphQLError} If post is not found (NOT_FOUND error code)
   * @throws {GraphQLError} If user is not authorized to update
   */
  async updatePost(id: string, input: any, userId: string, userRole: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new GraphQLError("Post not found", {
        extensions: { code: ErrorCodes.NOT_FOUND },
      });
    }

    AuthMiddleware.authorize(userId, post.userId, userRole);

    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: input,
    });

    logger.info(`Post updated: ${id} by user: ${userId}`);
    return updatedPost;
  }

  /**
   * Deletes a post
   * @param {string} id - ID of the post to delete
   * @param {string} userId - ID of the requesting user
   * @param {string} userRole - Role of the requesting user
   * @returns {Promise<boolean>} True if deletion was successful
   * @throws {GraphQLError} If post is not found (NOT_FOUND error code)
   * @throws {GraphQLError} If user is not authorized to delete
   */
  async deletePost(id: string, userId: string, userRole: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new GraphQLError("Post not found", {
        extensions: { code: ErrorCodes.NOT_FOUND },
      });
    }

    AuthMiddleware.authorize(userId, post.userId, userRole);

    await this.prisma.post.delete({
      where: { id },
    });

    logger.info(`Post deleted: ${id} by user: ${userId}`);
    return true;
  }

  /**
   * Gets the user who created a post
   * @param {string} userId - ID of the user to retrieve
   * @returns {Promise<User | null>} The post's author
   */
  async getUserForPost(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  /**
   * Gets top-level comments for a post
   * @param {string} postId - ID of the post
   * @returns {Promise<Comment[]>} Array of top-level comments
   */
  async getCommentsForPost(postId: string) {
    return this.prisma.comment.findMany({
      where: {
        postId,
        parentId: null, // Only top-level comments
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Gets all likes for a post
   * @param {string} postId - ID of the post
   * @returns {Promise<Like[]>} Array of likes
   */
  async getLikesForPost(postId: string) {
    return this.prisma.like.findMany({
      where: { postId },
    });
  }

  /**
   * Gets all ratings for a post
   * @param {string} postId - ID of the post
   * @returns {Promise<Rating[]>} Array of ratings
   */
  async getRatingsForPost(postId: string) {
    return this.prisma.rating.findMany({
      where: { postId },
    });
  }

  /**
   * Gets the count of likes for a post
   * @param {string} postId - ID of the post
   * @returns {Promise<number>} Total number of likes
   */
  async getLikesCountForPost(postId: string) {
    return this.prisma.like.count({
      where: { postId },
    });
  }

  /**
   * Calculates the average rating for a post
   * @param {string} postId - ID of the post
   * @returns {Promise<number | null>} Average rating or null if no ratings exist
   */
  async getAverageRatingForPost(postId: string) {
    const result = await this.prisma.rating.aggregate({
      where: { postId },
      _avg: {
        value: true,
      },
    });

    return result._avg.value;
  }
}