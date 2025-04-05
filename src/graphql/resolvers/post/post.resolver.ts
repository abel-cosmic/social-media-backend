import { AuthMiddleware } from "../../../middleware/auth.middleware";
import { PostService } from "../../services/post.service";
import { Context } from "../../../types/context";

/**
 * Creates a new PostService instance with the provided context
 * @param {Context} context - GraphQL context containing Prisma client
 * @returns {PostService} New PostService instance
 */
const createPostService = ({ prisma }: Context) => new PostService(prisma);

export const postResolvers = {
  Query: {
    /**
     * Fetches a single post by its ID
     * @param {any} _ - Unused parent parameter
     * @param {{ id: string }} params - Parameters object containing post ID
     * @param {Context} context - GraphQL context
     * @returns {Promise<Post>} The requested post
     * @throws {NotFoundError} If post doesn't exist
     */
    post: async (_: any, { id }: { id: string }, context: Context) => {
      const service = createPostService(context);
      return service.getPostById(id);
    },

    /**
     * Fetches all posts
     * @param {any} _ - Unused parent parameter
     * @param {any} __ - Unused arguments parameter
     * @param {Context} context - GraphQL context
     * @returns {Promise<Post[]>} Array of all posts
     */
    posts: async (_: any, __: any, context: Context) => {
      const service = createPostService(context);
      return service.getAllPosts();
    },

    /**
     * Fetches all posts by a specific user
     * @param {any} _ - Unused parent parameter
     * @param {{ userId: string }} params - Parameters object containing user ID
     * @param {Context} context - GraphQL context
     * @returns {Promise<Post[]>} Array of posts by the specified user
     * @throws {NotFoundError} If user doesn't exist
     */
    userPosts: async (
      _: any,
      { userId }: { userId: string },
      context: Context
    ) => {
      const service = createPostService(context);
      return service.getUserPosts(userId);
    },
  },

  Mutation: {
    /**
     * Creates a new post
     * @param {any} _ - Unused parent parameter
     * @param {{ input: CreatePostInput }} params - Parameters containing post data
     * @param {Context} context - GraphQL context
     * @returns {Promise<Post>} The newly created post
     * @throws {AuthenticationError} If user is not authenticated
     * @throws {ValidationError} If input data is invalid
     */
    createPost: async (_: any, { input }: any, context: Context) => {
      const user = AuthMiddleware.authenticate(context);
      const service = createPostService(context);
      return service.createPost(input, user.id);
    },

    /**
     * Updates an existing post
     * @param {any} _ - Unused parent parameter
     * @param {{ id: string, input: UpdatePostInput }} params - Parameters containing post ID and update data
     * @param {Context} context - GraphQL context
     * @returns {Promise<Post>} The updated post
     * @throws {AuthenticationError} If user is not authenticated
     * @throws {NotFoundError} If post doesn't exist
     * @throws {ForbiddenError} If user doesn't have permission to update
     * @throws {ValidationError} If input data is invalid
     */
    updatePost: async (_: any, { id, input }: any, context: Context) => {
      const user = AuthMiddleware.authenticate(context);
      const service = createPostService(context);
      return service.updatePost(id, input, user.id, user.role);
    },

    /**
     * Deletes a post
     * @param {any} _ - Unused parent parameter
     * @param {{ id: string }} params - Parameters containing post ID
     * @param {Context} context - GraphQL context
     * @returns {Promise<boolean>} True if deletion was successful
     * @throws {AuthenticationError} If user is not authenticated
     * @throws {NotFoundError} If post doesn't exist
     * @throws {ForbiddenError} If user doesn't have permission to delete
     */
    deletePost: async (_: any, { id }: { id: string }, context: Context) => {
      const user = AuthMiddleware.authenticate(context);
      const service = createPostService(context);
      return service.deletePost(id, user.id, user.role);
    },
  },

  Post: {
    /**
     * Resolves the user who created the post
     * @param {{ userId: string }} parent - The parent post object
     * @param {any} _ - Unused args parameter
     * @param {Context} context - GraphQL context
     * @returns {Promise<User>} The user who created the post
     */
    user: async ({ userId }: { userId: string }, _: any, context: Context) => {
      const service = createPostService(context);
      return service.getUserForPost(userId);
    },

    /**
     * Resolves all comments for the post
     * @param {{ id: string }} parent - The parent post object
     * @param {any} _ - Unused args parameter
     * @param {Context} context - GraphQL context
     * @returns {Promise<Comment[]>} Array of comments on the post
     */
    comments: async ({ id }: { id: string }, _: any, context: Context) => {
      const service = createPostService(context);
      return service.getCommentsForPost(id);
    },

    /**
     * Resolves all likes for the post
     * @param {{ id: string }} parent - The parent post object
     * @param {any} _ - Unused args parameter
     * @param {Context} context - GraphQL context
     * @returns {Promise<Like[]>} Array of likes on the post
     */
    likes: async ({ id }: { id: string }, _: any, context: Context) => {
      const service = createPostService(context);
      return service.getLikesForPost(id);
    },

    /**
     * Resolves all ratings for the post
     * @param {{ id: string }} parent - The parent post object
     * @param {any} _ - Unused args parameter
     * @param {Context} context - GraphQL context
     * @returns {Promise<Rating[]>} Array of ratings on the post
     */
    ratings: async ({ id }: { id: string }, _: any, context: Context) => {
      const service = createPostService(context);
      return service.getRatingsForPost(id);
    },

    /**
     * Resolves the count of likes for the post
     * @param {{ id: string }} parent - The parent post object
     * @param {any} _ - Unused args parameter
     * @param {Context} context - GraphQL context
     * @returns {Promise<number>} Total number of likes on the post
     */
    likesCount: async ({ id }: { id: string }, _: any, context: Context) => {
      const service = createPostService(context);
      return service.getLikesCountForPost(id);
    },

    /**
     * Resolves the average rating for the post
     * @param {{ id: string }} parent - The parent post object
     * @param {any} _ - Unused args parameter
     * @param {Context} context - GraphQL context
     * @returns {Promise<number>} Average rating of the post
     */
    avgRating: async ({ id }: { id: string }, _: any, context: Context) => {
      const service = createPostService(context);
      return service.getAverageRatingForPost(id);
    },
  },
};
