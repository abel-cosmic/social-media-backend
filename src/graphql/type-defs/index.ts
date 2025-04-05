import { userTypeDefs } from './user.type-defs';
import { postTypeDefs } from './post.type-defs';
import { commentTypeDefs } from './comment.type-defs';
import { likeTypeDefs } from './like.type-defs';
import { ratingTypeDefs } from './rating.type-defs';

const baseTypeDefs = `#graphql
  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }
`;

export const typeDefs = [
  baseTypeDefs,
  userTypeDefs,
  postTypeDefs,
  commentTypeDefs, 
  likeTypeDefs,
  ratingTypeDefs
];