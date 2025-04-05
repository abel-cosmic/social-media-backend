export const likeTypeDefs = `#graphql
  type Like {
    id: ID!
    userId: ID!
    user: User!
    postId: ID!
    post: Post!
    createdAt: String!
  }

  extend type Mutation {
    likePost(postId: ID!): Like!
    unlikePost(postId: ID!): Boolean!
  }
`;