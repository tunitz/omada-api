# syntax = docker/dockerfile:1

# Adjust BUN_VERSION as desired
ARG BUN_VERSION=1.0.1
FROM oven/bun:${BUN_VERSION} as base

LABEL fly_launch_runtime="Bun"

# Bun app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Throw-away build stage to reduce size of final image
FROM base as build

COPY --link bun.lockb package.json ./
COPY --link src src
RUN bun install --ci
RUN bun run compile

# Copy application code
COPY --link . .

# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app/build /app/build
COPY --from=build /app/public /app/public




# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "bun", "build/index.js" ]
