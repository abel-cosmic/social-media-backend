import { userResolvers } from './user.resolver';
import { postResolvers } from './post.resolver';
import { commentResolvers } from './comment.resolver';
import { likeResolvers } from './like.resolver';
import { ratingResolvers } from './rating.resolver';

export const resolvers = [
  userResolvers,
  postResolvers,
  commentResolvers,
  likeResolvers,
  ratingResolvers
];