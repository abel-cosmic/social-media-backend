import { AuthMiddleware } from "../../../middleware/auth.middleware";
import { CommentService } from "../../services/comment.service";
import { Context } from "../../../types/context";

/**
 * Creates a new CommentService instance with the provided context
 * @param {Context} context - GraphQL context containing Prisma client
 * @returns {CommentService} New CommentService instance
 */
const createCommentService = ({ prisma }: Context) =>
  new CommentService(prisma);

export const commentResolvers = {
  Query: {
    /**
     * Fetches a single comment by its ID
     * @param {any} _ - Unused parent parameter
     * @param {{ id: string }} params - Parameters object containing comment ID
     * @param {Context} context - GraphQL context
     * @returns {Promise<Comment>} The requested comment
     */
    comment: async (_: any, { id }: { id: string }, context: Context) => {
      const service = createCommentService(context);
      return service.getCommentById(id);
    },

    /**
     * Fetches all comments for a specific post
     * @param {any} _ - Unused parent parameter
     * @param {{ postId: string }} params - Parameters object containing post ID
     * @param {Context} context - GraphQL context
     * @returns {Promise<Comment[]>} Array of comments for the specified post
     */
    postComments: async (
      _: any,
      { postId }: { postId: string },
      context: Context
    ) => {
      const service = createCommentService(context);
      return service.getCommentsByPostId(postId);
    },
  },

  Mutation: {
    /**
     * Creates a new comment
     * @param {any} _ - Unused parent parameter
     * @param {{ input: CreateCommentInput }} params - Parameters containing comment data
     * @param {Context} context - GraphQL context
     * @returns {Promise<Comment>} The newly created comment
     * @throws {AuthenticationError} If user is not authenticated
     */
    createComment: async (_: any, { input }: any, context: Context) => {
      const user = AuthMiddleware.authenticate(context);
      const service = createCommentService(context);
      return service.createComment(input, user.id);
    },

    /**
     * Updates an existing comment
     * @param {any} _ - Unused parent parameter
     * @param {{ id: string, input: UpdateCommentInput }} params - Parameters containing comment ID and update data
     * @param {Context} context - GraphQL context
     * @returns {Promise<Comment>} The updated comment
     * @throws {AuthenticationError} If user is not authenticated
     * @throws {ForbiddenError} If user doesn't have permission to update
     */
    updateComment: async (_: any, { id, input }: any, context: Context) => {
      const user = AuthMiddleware.authenticate(context);
      const service = createCommentService(context);
      return service.updateComment(id, input, user.id, user.role);
    },

    /**
     * Deletes a comment
     * @param {any} _ - Unused parent parameter
     * @param {{ id: string }} params - Parameters containing comment ID
     * @param {Context} context - GraphQL context
     * @returns {Promise<boolean>} True if deletion was successful
     * @throws {AuthenticationError} If user is not authenticated
     * @throws {ForbiddenError} If user doesn't have permission to delete
     */
    deleteComment: async (_: any, { id }: { id: string }, context: Context) => {
      const user = AuthMiddleware.authenticate(context);
      const service = createCommentService(context);
      return service.deleteComment(id, user.id, user.role);
    },
  },

  Comment: {
    /**
     * Resolves the user who created the comment
     * @param {{ userId: string }} parent - The parent comment object
     * @param {any} _ - Unused args parameter
     * @param {Context} context - GraphQL context
     * @returns {Promise<User>} The user who created the comment
     */
    user: async ({ userId }: { userId: string }, _: any, context: Context) => {
      const service = createCommentService(context);
      return service.getUserForComment(userId);
    },

    /**
     * Resolves the post the comment belongs to
     * @param {{ postId: string }} parent - The parent comment object
     * @param {any} _ - Unused args parameter
     * @param {Context} context - GraphQL context
     * @returns {Promise<Post>} The post the comment belongs to
     */
    post: async ({ postId }: { postId: string }, _: any, context: Context) => {
      const service = createCommentService(context);
      return service.getPostForComment(postId);
    },

    /**
     * Resolves the parent comment if this is a reply
     * @param {{ parentId: string | null }} parent - The parent comment object
     * @param {any} _ - Unused args parameter
     * @param {Context} context - GraphQL context
     * @returns {Promise<Comment | null>} The parent comment or null if top-level
     */
    parent: async (
      { parentId }: { parentId: string | null },
      _: any,
      context: Context
    ) => {
      const service = createCommentService(context);
      return service.getParentComment(parentId);
    },

    /**
     * Resolves all replies to this comment
     * @param {{ id: string }} parent - The parent comment object
     * @param {any} _ - Unused args parameter
     * @param {Context} context - GraphQL context
     * @returns {Promise<Comment[]>} Array of reply comments
     */
    replies: async ({ id }: { id: string }, _: any, context: Context) => {
      const service = createCommentService(context);
      return service.getCommentReplies(id);
    },
  },
};
