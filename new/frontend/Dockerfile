# syntax=docker/dockerfile:1
# check=error=true

FROM oven/bun:alpine AS prod-dependencies
    WORKDIR /
    RUN	--mount=type=bind,source=package.json,target=package.json \
        --mount=type=bind,source=bun.lockb,target=bun.lockb \
        --mount=type=cache,target=/root/.bun/install/cache \
        bun install

FROM oven/bun:alpine AS build
    WORKDIR /app/frontend

    ARG RELEASE_IDENTIFIER
    ARG BUILD_NUMBER
    RUN echo "RELEASE_IDENTIFIER=${RELEASE_IDENTIFIER:-debug}" >> .env && \
        echo "BUILD_NUMBER=${BUILD_NUMBER:-0}" >> .env

    COPY --from=prod-dependencies /node_modules ./node_modules
    COPY --from=shared / /app/shared
    RUN cd /app/shared && bun install && cd ..
    COPY ./ ./
    RUN bun run build

FROM ghcr.io/nikeee/docker-nginx-spa:latest
    WORKDIR /app
    EXPOSE 80

    COPY ./src/_healthcheck.sh /_healthcheck.sh
    COPY --from=build /app/frontend/dist /app

    HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
        CMD /_healthcheck.sh
