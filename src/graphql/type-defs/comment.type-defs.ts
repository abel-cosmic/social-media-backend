export const commentTypeDefs = `#graphql
  type Comment {
    id: ID!
    userId: ID!
    user: User!
    postId: ID!
    post: Post!
    content: String!
    parentId: ID
    parent: Comment
    replies: [Comment!]!
    createdAt: String!
    updatedAt: String!
  }

  input CreateCommentInput {
    postId: ID!
    content: String!
    parentId: ID
  }

  input UpdateCommentInput {
    content: String!
  }

  type CommentResponse {
    id: ID!
    content: String!
    createdAt: String!
    updatedAt: String!
    user: User!
    post: Post!
  }

  type PostCommentsResponse {
    comments: [Comment!]!
    totalCount: Int!
  }

  extend type Query {
    comment(id: ID!): Comment
    postComments(postId: ID!): PostCommentsResponse!
  }

  extend type Mutation {
    createComment(input: CreateCommentInput!): CommentResponse!
    updateComment(id: ID!, input: UpdateCommentInput!): CommentResponse!
    deleteComment(id: ID!): Boolean!
  }
`;
