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
