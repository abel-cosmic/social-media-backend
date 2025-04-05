export const postTypeDefs = `#graphql
  type Post {
    id: ID!
    userId: ID!
    user: User!
    mediaFile: String!
    caption: String
    createdAt: String!
    updatedAt: String!
    comments: [Comment!]
    likes: [Like!]
    ratings: [Rating!]
    likesCount: Int!
    avgRating: Float
  }

  input CreatePostInput {
    mediaFile: String!
    caption: String
  }

  input UpdatePostInput {
    mediaFile: String
    caption: String
  }

  extend type Query {
    post(id: ID!): Post
    posts: [Post!]!
    userPosts(userId: ID!): [Post!]!
  }

  extend type Mutation {
    createPost(input: CreatePostInput!): Post!
    updatePost(id: ID!, input: UpdatePostInput!): Post!
    deletePost(id: ID!): Boolean!
  }
`;