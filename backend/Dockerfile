# syntax=docker/dockerfile:1
# check=error=true

FROM node:22-alpine AS base
    RUN apk add build-base python3
    WORKDIR /app/backend

FROM base AS build
    RUN mkdir -p /app/shared
    RUN	--mount=type=bind,source=package.json,target=package.json \
        --mount=type=bind,source=package-lock.json,target=package-lock.json \
        --mount=type=cache,target=/root/.npm \
        npm ci --legacy-peer-deps

    COPY --from=shared --chown=node / /app/shared
    COPY --chown=node ./ ./
    RUN npm run build:prod

FROM base AS prod-dependencies
    RUN	--mount=type=bind,source=package.json,target=package.json \
        --mount=type=bind,source=package-lock.json,target=package-lock.json \
        --mount=type=cache,target=/root/.npm \
        npm ci --legacy-peer-deps --omit=dev

FROM node:22-alpine
    RUN apk add --no-cache tini
    ENTRYPOINT ["/sbin/tini", "--"]

    USER node
    WORKDIR /home/node
    EXPOSE 8080
    ENV NODE_ENV=production

    # See best practices: https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md
    CMD [ "node", "index.js" ]

    COPY --chown=node package.json package-lock.json ./
    COPY --chown=node --from=prod-dependencies /app/backend/node_modules ./node_modules
    COPY --chown=node --from=build /app/backend/dist ./
    