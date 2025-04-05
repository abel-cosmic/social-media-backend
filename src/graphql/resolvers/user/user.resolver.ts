import { AuthMiddleware } from "../../../middleware/auth.middleware";
import { UserService } from "../../services/user.service";
import { Context } from "../../../types/context";

/**
 * Creates a new UserService instance with the provided context
 * @param {Context} context - GraphQL context containing Prisma client
 * @returns {UserService} New UserService instance
 */
const createUserService = ({ prisma }: Context) => new UserService(prisma);

export const userResolvers = {
  Query: {
    /**
     * Gets the currently authenticated user's profile
     * @param {any} _ - Unused parent parameter
     * @param {any} __ - Unused arguments parameter
     * @param {Context} context - GraphQL context
     * @returns {Promise<User>} The authenticated user's data
     * @throws {AuthenticationError} If user is not authenticated
     */
    me: async (_: any, __: any, context: Context) => {
      const user = AuthMiddleware.authenticate(context);
      const service = createUserService(context);
      return service.getCurrentUser(user.id);
    },

    /**
     * Gets a user by their ID
     * @param {any} _ - Unused parent parameter
     * @param {{ id: string }} params - Parameters object containing user ID
     * @param {Context} context - GraphQL context
     * @returns {Promise<User>} The requested user's data
     * @throws {NotFoundError} If user doesn't exist
     */
    user: async (_: any, { id }: { id: string }, context: Context) => {
      const service = createUserService(context);
      return service.getUserById(id);
    },

    /**
     * Gets all users (admin-only)
     * @param {any} _ - Unused parent parameter
     * @param {any} __ - Unused arguments parameter
     * @param {Context} context - GraphQL context
     * @returns {Promise<User[]>} Array of all users
     * @throws {AuthenticationError} If user is not authenticated
     * @throws {ForbiddenError} If user is not an admin
     */
    users: async (_: any, __: any, context: Context) => {
      const user = AuthMiddleware.authenticate(context);
      const service = createUserService(context);
      return service.getAllUsers(user.role);
    },
  },

  Mutation: {
    /**
     * Registers a new user
     * @param {any} _ - Unused parent parameter
     * @param {{ input: RegisterInput }} params - Input object containing user registration data
     * @param {Context} context - GraphQL context
     * @returns {Promise<AuthPayload>} Authentication payload containing user and token
     * @throws {ValidationError} If input data is invalid
     * @throws {ConflictError} If email is already registered
     */
    register: async (_: any, { input }: any, context: Context) => {
      const service = createUserService(context);
      return service.registerUser(input);
    },

    /**
     * Authenticates a user
     * @param {any} _ - Unused parent parameter
     * @param {{ input: LoginInput }} params - Input object containing credentials
     * @param {Context} context - GraphQL context
     * @returns {Promise<AuthPayload>} Authentication payload containing user and token
     * @throws {AuthenticationError} If credentials are invalid
     * @throws {ValidationError} If input data is invalid
     */
    login: async (_: any, { input }: any, context: Context) => {
      const service = createUserService(context);
      return service.loginUser(input.email, input.password);
    },

    /**
     * Updates the authenticated user's profile
     * @param {any} _ - Unused parent parameter
     * @param {{ input: UpdateUserInput }} params - Input object containing update data
     * @param {Context} context - GraphQL context
     * @returns {Promise<User>} The updated user data
     * @throws {AuthenticationError} If user is not authenticated
     * @throws {ValidationError} If input data is invalid
     * @throws {ConflictError} If new email is already taken
     */
    updateUser: async (_: any, { input }: any, context: Context) => {
      const user = AuthMiddleware.authenticate(context);
      const service = createUserService(context);
      return service.updateUser(user.id, input);
    },

    /**
     * Deletes the authenticated user's account
     * @param {any} _ - Unused parent parameter
     * @param {any} __ - Unused arguments parameter
     * @param {Context} context - GraphQL context
     * @returns {Promise<boolean>} True if deletion was successful
     * @throws {AuthenticationError} If user is not authenticated
     */
    deleteUser: async (_: any, __: any, context: Context) => {
      const user = AuthMiddleware.authenticate(context);
      const service = createUserService(context);
      return service.deleteUser(user.id);
    },
  },

  User: {
    /**
     * Resolves the posts created by this user
     * @param {{ id: string }} parent - The parent user object
     * @param {any} _ - Unused args parameter
     * @param {Context} context - GraphQL context
     * @returns {Promise<Post[]>} Array of posts created by the user
     */
    posts: async ({ id }: { id: string }, _: any, context: Context) => {
      const service = createUserService(context);
      return service.getUserPosts(id);
    },
  },
};
