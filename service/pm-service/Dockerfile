# syntax=docker/dockerfile:1
# check=error=true

FROM oven/bun:latest AS runtime-dependencies
    WORKDIR /app
    RUN --mount=type=bind,source=package.json,target=package.json \
        --mount=type=bind,source=bun.lockb,target=bun.lockb \
        --mount=type=cache,target=/root/.bun/install/cache \
        NODE_ENV=production bun install

FROM oven/bun:latest
    WORKDIR /app

    ENV NODE_ENV=production

    COPY --from=runtime-dependencies /app/node_modules /app/node_modules
    COPY ./ ./

    ENTRYPOINT ["bun", "src/index.ts"]
