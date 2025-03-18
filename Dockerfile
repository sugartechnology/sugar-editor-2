# Base image
FROM node:23-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Development environment
FROM base AS dev

ENV NODE_ENV=development

# Expose development port
EXPOSE 3000

# Start Rollup with live dev server
CMD ["npx", "rollup", "-c", "--watch"]

# Production environment
FROM base AS build

ENV NODE_ENV=production

# Run Rollup build
RUN npx rollup -c

# Static file server
FROM node:23-alpine AS prod

WORKDIR /app

# Install minimal dependencies
RUN npm install -g serve

# Copy built files from build stage
COPY --from=build /app/dist ./dist

EXPOSE 5000

# Serve built static files
CMD ["serve", "dist"]
