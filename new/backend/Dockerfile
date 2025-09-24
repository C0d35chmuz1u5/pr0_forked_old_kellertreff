# syntax=docker/dockerfile:1
# check=error=true

FROM oven/bun:alpine AS base
    WORKDIR /app/backend
    RUN mkdir -p /app/shared

FROM base AS prod-dependencies
    RUN	--mount=type=bind,source=package.json,target=package.json \
        --mount=type=bind,source=bun.lockb,target=bun.lockb \
        --mount=type=cache,target=/root/.bun/install/cache \
        NODE_ENV=production bun install

FROM base
    ARG RELEASE_IDENTIFIER
    ARG BUILD_NUMBER
    RUN echo "RELEASE_IDENTIFIER=${RELEASE_IDENTIFIER:-debug}" >> /app/backend/.env && \
        echo "BUILD_NUMBER=${BUILD_NUMBER:-0}" >> /app/backend/.env

    ENTRYPOINT ["bun", "src/index.ts"]

    COPY --chown=bun package.json bun.lockb tsconfig.json ./
    COPY --chown=bun --from=prod-dependencies /app/backend/node_modules ./node_modules
    COPY --chown=bun ./src ./src

    USER bun

    HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
        CMD bun run /app/backend/_healthcheck.ts
