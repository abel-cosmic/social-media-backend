export const ratingTypeDefs = `#graphql
  type Rating {
    id: ID!
    userId: ID!
    user: User!
    postId: ID!
    post: Post!
    value: Int!
    createdAt: String!
    updatedAt: String!
  }

  input RatePostInput {
    postId: ID!
    value: Int!
  }

  extend type Mutation {
    ratePost(input: RatePostInput!): Rating!
  }
`;