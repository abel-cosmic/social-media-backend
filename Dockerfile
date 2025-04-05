FROM node:18-alpine

# Install required dependencies including openssl
RUN apk add --no-cache openssl openssl-dev

WORKDIR /usr/src/app

# Install pnpm and nodemon globally
RUN npm install -g pnpm nodemon

COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including devDependencies)
RUN pnpm install

# Copy Prisma schema and generate client
COPY prisma/schema.prisma ./prisma/
RUN pnpm prisma:generate

COPY . .

EXPOSE 4000

CMD ["pnpm", "dev"]