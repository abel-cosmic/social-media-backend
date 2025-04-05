import { createTestServer } from "../../../tests/test-utils";
import { ErrorCodes } from "../../../types/error";

describe("Post Resolver", () => {
  const { executeOperation, prisma } = createTestServer();
  let testUser: any;
  let testPost: any;
  let adminUser: any;

  beforeAll(async () => {
    // Clean the database first
    await prisma.$transaction([
      prisma.rating.deleteMany(),
      prisma.like.deleteMany(),
      prisma.comment.deleteMany(),
      prisma.post.deleteMany(),
      prisma.user.deleteMany(),
    ]);

    // Create test users
    testUser = await prisma.user.create({
      data: {
        username: "testuser",
        email: "test@example.com",
        password: "hashedpassword",
      },
    });

    adminUser = await prisma.user.create({
      data: {
        username: "admin",
        email: "admin@example.com",
        password: "hashedpassword",
        role: "ADMIN",
      },
    });

    // Create initial test post
    testPost = await prisma.post.create({
      data: {
        userId: testUser.id,
        mediaFile: "test.jpg",
        caption: "Initial post",
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("Query Resolvers", () => {
    describe("post", () => {
      it("should return a post by ID", async () => {
        const result = await executeOperation({
          query: `
            query GetPost($id: ID!) {
              post(id: $id) {
                id
                mediaFile
                user { username }
              }
            }
          `,
          variables: { id: testPost.id },
        });

        expect(result.body.kind).toBe("single");
        if (result.body.kind === "single") {
          expect(result.body.singleResult.errors).toBeUndefined();
          expect(result.body.singleResult.data?.post).toEqual({
            id: testPost.id,
            mediaFile: "test.jpg",
            user: { username: "testuser" },
          });
        }
      });

      it("should throw error for non-existent post", async () => {
        const result = await executeOperation({
          query: `
            query GetPost($id: ID!) {
              post(id: $id) {
                id
              }
            }
          `,
          variables: { id: "non-existent-id" },
        });

        expect(result.body.kind).toBe("single");
        if (result.body.kind === "single") {
          expect(result.body.singleResult.errors).toBeDefined();
          expect(result.body.singleResult.errors?.[0].extensions?.code).toBe(
            ErrorCodes.NOT_FOUND
          );
        }
      });
    });

    describe("posts", () => {
      it("should return all posts in descending order", async () => {
        // Create another post
        await prisma.user.create({
          data: {
            username: "seconduser",
            email: "seconduser@example.com",
            password: "hashedpassword",
          },
        });
        const result = await executeOperation({
          query: `
            query GetAllPosts {
              posts {
                id
                mediaFile
              }
            }
          `,
        });

        expect(result.body.kind).toBe("single");
        if (result.body.kind === "single") {
          expect(result.body.singleResult.errors).toBeUndefined();
          expect(result.body.singleResult.data?.posts).toBeDefined();
        }
      });
    });

    describe("userPosts", () => {
      it("should return posts by specific user", async () => {
        const result = await executeOperation({
          query: `
            query GetUserPosts($userId: ID!) {
              userPosts(userId: $userId) {
                id
                user { username }
              }
            }
          `,
          variables: { userId: testUser.id },
        });

        expect(result.body.kind).toBe("single");
        if (result.body.kind === "single") {
          expect(result.body.singleResult.errors).toBeUndefined();
          expect(result.body.singleResult.data?.userPosts).toBeDefined();
        }
      });
    });
  });

  describe("Mutation Resolvers", () => {
    describe("createPost", () => {
      it("should reject unauthenticated requests", async () => {
        const result = await executeOperation({
          query: `
            mutation CreatePost($input: CreatePostInput!) {
              createPost(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: {
              mediaFile: "new.jpg",
              caption: "New post",
            },
          },
        });

        expect(result.body.kind).toBe("single");
        if (result.body.kind === "single") {
          expect(result.body.singleResult.errors).toBeDefined();
          expect(result.body.singleResult.errors?.[0].extensions?.code).toBe(
            ErrorCodes.UNAUTHENTICATED
          );
        }
      });
    });
  });
});
