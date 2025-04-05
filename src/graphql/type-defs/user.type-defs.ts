export const userTypeDefs = `#graphql
  enum Role {
    USER
    ADMIN
  }

  type User {
    id: ID!
    username: String!
    email: String!
    bio: String
    profilePicture: String
    role: Role!
    createdAt: String!
    updatedAt: String!
    posts: [Post!]
  }

  input RegisterInput {
    username: String!
    email: String!
    password: String!
    bio: String
    profilePicture: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateUserInput {
    username: String
    bio: String
    profilePicture: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  extend type Query {
    me: User
    user(id: ID!): User
    users: [User!]!
  }

  extend type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    updateUser(input: UpdateUserInput!): User!
    deleteUser: Boolean!
  }
`;