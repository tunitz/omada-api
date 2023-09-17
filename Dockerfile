# syntax = docker/dockerfile:1

# Adjust BUN_VERSION as desired
ARG BUN_VERSION=1.0.1
FROM oven/bun:${BUN_VERSION} as base

LABEL fly_launch_runtime="Bun"

# Bun app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

COPY src src
COPY public public
COPY package.json ./

RUN bun run compile

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "bun", "build/index.js" ]
