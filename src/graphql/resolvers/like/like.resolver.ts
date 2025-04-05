import { AuthMiddleware } from "../../../middleware/auth.middleware";
import { LikeService } from "../../services/like.service";
import { Context } from "../../../types/context";

/**
 * Creates a new LikeService instance with the provided context
 * @param {Context} context - GraphQL context containing Prisma client
 * @returns {LikeService} New LikeService instance
 */
const createLikeService = ({ prisma }: Context) => new LikeService(prisma);

export const likeResolvers = {
  Mutation: {
    /**
     * Adds a like to a post by the authenticated user
     * @param {any} _ - Unused parent parameter
     * @param {{ postId: string }} params - Parameters object containing post ID to like
     * @param {Context} context - GraphQL context
     * @returns {Promise<Like>} The created like object
     * @throws {AuthenticationError} If user is not authenticated
     * @throws {NotFoundError} If post doesn't exist
     * @throws {ConflictError} If user already liked the post
     */
    likePost: async (
      _: any,
      { postId }: { postId: string },
      context: Context
    ) => {
      const user = AuthMiddleware.authenticate(context);
      const service = createLikeService(context);
      return service.likePost(postId, user.id);
    },

    /**
     * Removes a like from a post by the authenticated user
     * @param {any} _ - Unused parent parameter
     * @param {{ postId: string }} params - Parameters object containing post ID to unlike
     * @param {Context} context - GraphQL context
     * @returns {Promise<boolean>} True if the like was successfully removed
     * @throws {AuthenticationError} If user is not authenticated
     * @throws {NotFoundError} If like doesn't exist
     */
    unlikePost: async (
      _: any,
      { postId }: { postId: string },
      context: Context
    ) => {
      const user = AuthMiddleware.authenticate(context);
      const service = createLikeService(context);
      return service.unlikePost(postId, user.id);
    },
  },

  Like: {
    /**
     * Resolves the user who created the like
     * @param {{ userId: string }} parent - The parent like object
     * @param {any} _ - Unused args parameter
     * @param {Context} context - GraphQL context
     * @returns {Promise<User>} The user who created the like
     */
    user: async ({ userId }: { userId: string }, _: any, context: Context) => {
      const service = createLikeService(context);
      return service.getUserForLike(userId);
    },

    /**
     * Resolves the post that was liked
     * @param {{ postId: string }} parent - The parent like object
     * @param {any} _ - Unused args parameter
     * @param {Context} context - GraphQL context
     * @returns {Promise<Post>} The post that was liked
     */
    post: async ({ postId }: { postId: string }, _: any, context: Context) => {
      const service = createLikeService(context);
      return service.getPostForLike(postId);
    },
  },
};
