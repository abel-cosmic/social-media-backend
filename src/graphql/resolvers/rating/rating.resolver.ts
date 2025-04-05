import { AuthMiddleware } from "../../../middleware/auth.middleware";
import { Context } from "../../../types/context";
import { RatingService } from "../../services/rating.service";

/**
 * Creates a new RatingService instance with the provided context
 * @param {Context} context - GraphQL context containing Prisma client
 * @returns {RatingService} New RatingService instance
 */
const createRatingService = ({ prisma }: Context) => new RatingService(prisma);

export const ratingResolvers = {
  Mutation: {
    /**
     * Rates a post with the specified value
     * @param {any} _ - Unused parent parameter
     * @param {{ input: RatePostInput }} params - Input object containing:
     *   @property {string} postId - ID of the post to rate
     *   @property {number} value - Rating value (typically 1-5)
     * @param {Context} context - GraphQL context
     * @returns {Promise<Rating>} The created or updated rating
     * @throws {AuthenticationError} If user is not authenticated
     * @throws {NotFoundError} If post doesn't exist
     * @throws {ValidationError} If rating value is invalid
     * @throws {ForbiddenError} If user tries to rate their own post
     */
    ratePost: async (_: any, { input }: any, context: Context) => {
      const user = AuthMiddleware.authenticate(context);
      const service = createRatingService(context);
      return service.ratePost(input.postId, user.id, input.value);
    },
  },

  Rating: {
    /**
     * Resolves the user who created the rating
     * @param {{ userId: string }} parent - The parent rating object
     * @param {any} _ - Unused args parameter
     * @param {Context} context - GraphQL context
     * @returns {Promise<User>} The user who created the rating
     */
    user: async ({ userId }: { userId: string }, _: any, context: Context) => {
      const service = createRatingService(context);
      return service.getUserForRating(userId);
    },

    /**
     * Resolves the post that was rated
     * @param {{ postId: string }} parent - The parent rating object
     * @param {any} _ - Unused args parameter
     * @param {Context} context - GraphQL context
     * @returns {Promise<Post>} The post that was rated
     */
    post: async ({ postId }: { postId: string }, _: any, context: Context) => {
      const service = createRatingService(context);
      return service.getPostForRating(postId);
    },
  },
};