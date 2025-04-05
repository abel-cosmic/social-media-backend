# Social Media API with GraphQL

A robust backend API for a social media platform built with GraphQL, TypeScript, and Prisma.

## Features

- **User Management**: Registration, authentication, profile updates
- **Posts**: Create, read, update, and delete posts with media
- **Comments**: Threaded comments with nested replies
- **Interactions**: Like posts and rate them (1-5 stars)
- **Authentication**: JWT-based security
- **Error Handling**: Comprehensive error management
- **Database**: MySQL with Prisma ORM

## Technologies

- Node.js & TypeScript
- Apollo Server (GraphQL)
- Prisma ORM with MySQL
- JWT Authentication
- Winston Logging
- Dockerized Environment

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/social-media-api.git
   cd social-media-api
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Configure environment:
   ```bash
   cp .env.example .env
   # Edit the .env file with your settings
   ```

4. Start services:
   ```bash
   docker-compose up -d
   ```

5. Run migrations:
   ```bash
   pnpm prisma:migrate
   ```

6. Start development server:
   ```bash
   pnpm dev
   ```

The GraphQL Playground will be available at `http://localhost:4000`.

## API Examples

**User Registration:**
```graphql
mutation Register {
  register(input: {
    username: "newuser",
    email: "user@example.com",
    password: "password123"
  }) {
    token
    user { id username email }
  }
}
```

**Create Post:**
```graphql
mutation CreatePost {
  createPost(input: {
    mediaFile: "https://example.com/image.jpg",
    caption: "Check this out!"
  }) {
    id
    mediaFile
    user { username }
  }
}
```

## Database Schema

The Prisma schema defines models for:
- Users
- Posts
- Comments
- Likes
- Ratings

## Deployment

Production deployment:
```bash
docker-compose -f docker-compose.prod.yml up --build -d
```