import { AuthMiddleware } from "../../middleware/auth.middleware";
import { ErrorCodes } from "../../types/error";
import { logger } from "../../utils/logger";
import { PrismaClient } from "@prisma/client";
import { GraphQLError } from "graphql";

/**
 * Service class for handling comment-related operations
 */
export class CommentService {
  /**
   * Creates an instance of CommentService
   * @param {PrismaClient} prisma - Prisma client instance
   */
  constructor(private prisma: PrismaClient) {}

  /**
   * Retrieves a comment by its ID
   * @param {string} id - The ID of the comment to retrieve
   * @returns {Promise<Comment | null>} The found comment or null if not found
   */
  async getCommentById(id: string) {
    return this.prisma.comment.findUnique({
      where: { id },
    });
  }

  /**
   * Retrieves all top-level comments for a post
   * @param {string} postId - The ID of the post to get comments for
   * @returns {Promise<Comment[]>} Array of comments for the specified post
   */
  async getCommentsByPostId(postId: string) {
    return this.prisma.comment.findMany({
      where: {
        postId,
        parentId: null, // Only top-level comments
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Creates a new comment
   * @param {Object} input - Comment creation data
   * @param {string} input.postId - ID of the post being commented on
   * @param {string} input.content - The comment content
   * @param {string} [input.parentId] - Optional parent comment ID for replies
   * @param {string} userId - ID of the user creating the comment
   * @returns {Promise<Comment>} The newly created comment
   * @throws {GraphQLError} If post or parent comment not found
   * @throws {GraphQLError} If parent comment doesn't belong to the post
   */
  async createComment(
    input: {
      postId: string;
      content: string;
      parentId?: string;
    },
    userId: string
  ) {
    const { postId, content, parentId } = input;
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new GraphQLError("Post not found", {
        extensions: { code: ErrorCodes.NOT_FOUND },
      });
    }

    if (parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment) {
        throw new GraphQLError("Parent comment not found", {
          extensions: { code: ErrorCodes.NOT_FOUND },
        });
      }
      if (parentComment.postId !== postId) {
        throw new GraphQLError("Parent comment does not belong to this post", {
          extensions: { code: ErrorCodes.BAD_USER_INPUT },
        });
      }
    }

    const comment = await this.prisma.comment.create({
      data: {
        userId,
        postId,
        content,
        parentId,
      },
    });

    logger.info(`Comment created: ${comment.id} by user: ${userId}`);
    return comment;
  }

  /**
   * Updates an existing comment
   * @param {string} id - The ID of the comment to update
   * @param {Object} input - Fields to update
   * @param {string} userId - ID of the requesting user
   * @param {string} userRole - Role of the requesting user
   * @returns {Promise<Comment>} The updated comment
   * @throws {GraphQLError} If comment not found
   * @throws {GraphQLError} If unauthorized to update
   */
  async updateComment(
    id: string,
    input: Record<string, any>,
    userId: string,
    userRole: string
  ) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new GraphQLError("Comment not found", {
        extensions: { code: ErrorCodes.NOT_FOUND },
      });
    }

    AuthMiddleware.authorize(userId, comment.userId, userRole);

    const updatedComment = await this.prisma.comment.update({
      where: { id },
      data: input,
    });

    logger.info(`Comment updated: ${id} by user: ${userId}`);
    return updatedComment;
  }

  /**
   * Deletes a comment
   * @param {string} id - The ID of the comment to delete
   * @param {string} userId - ID of the requesting user
   * @param {string} userRole - Role of the requesting user
   * @returns {Promise<boolean>} True if deletion was successful
   * @throws {GraphQLError} If comment not found
   * @throws {GraphQLError} If unauthorized to delete
   */
  async deleteComment(id: string, userId: string, userRole: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new GraphQLError("Comment not found", {
        extensions: { code: ErrorCodes.NOT_FOUND },
      });
    }

    AuthMiddleware.authorize(userId, comment.userId, userRole);

    await this.prisma.comment.delete({
      where: { id },
    });

    logger.info(`Comment deleted: ${id} by user: ${userId}`);
    return true;
  }

  /**
   * Gets the user who created a comment
   * @param {string} userId - The ID of the user to retrieve
   * @returns {Promise<User | null>} The user who created the comment
   */
  async getUserForComment(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  /**
   * Gets the post that a comment belongs to
   * @param {string} postId - The ID of the post to retrieve
   * @returns {Promise<Post | null>} The post the comment belongs to
   */
  async getPostForComment(postId: string) {
    return this.prisma.post.findUnique({
      where: { id: postId },
    });
  }

  /**
   * Gets the parent comment of a reply
   * @param {string | null} parentId - The ID of the parent comment (null for top-level comments)
   * @returns {Promise<Comment | null>} The parent comment or null if top-level
   */
  async getParentComment(parentId: string | null) {
    if (!parentId) return null;
    return this.prisma.comment.findUnique({
      where: { id: parentId },
    });
  }

  /**
   * Gets all replies to a comment
   * @param {string} commentId - The ID of the parent comment
   * @returns {Promise<Comment[]>} Array of reply comments
   */
  async getCommentReplies(commentId: string) {
    return this.prisma.comment.findMany({
      where: { parentId: commentId },
      orderBy: { createdAt: "asc" },
    });
  }

  /**
   * Gets the count of nested comments (replies) for a comment
   * @param {string} commentId - The ID of the parent comment
   * @returns {Promise<number>} The count of nested comments
   */
  async getNestedCommentCount(commentId: string) {
    return this.prisma.comment.count({
      where: {
        parentId: commentId,
      },
    });
  }
}