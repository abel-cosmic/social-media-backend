import { userResolvers } from "./user/user.resolver";
import { postResolvers } from "./post/post.resolver";
import { commentResolvers } from "./comment/comment.resolver";
import { likeResolvers } from "./like/like.resolver";
import { ratingResolvers } from "./rating/rating.resolver";

export const resolvers = [
  userResolvers,
  postResolvers,
  commentResolvers,
  likeResolvers,
  ratingResolvers,
];
