# syntax=docker/dockerfile:1
# check=error=true

# Build this image using:
#   docker build . -f Dockerfile.fe --pull -t kt-fe --build-arg ENVIRONMENT=prod
# With "prod" being one of the environments specified in the package.json

FROM node:22-alpine AS build
    RUN apk add build-base python3
    WORKDIR /app/frontend

    RUN	--mount=type=bind,source=package.json,target=package.json \
        --mount=type=bind,source=package-lock.json,target=package-lock.json \
        --mount=type=cache,target=/root/.npm \
        npm ci --legacy-peer-deps

    COPY --from=shared --chown=node / /app/shared

    COPY --chown=node ./ ./
    RUN npm run build:prod

FROM ghcr.io/nikeee/docker-nginx-spa:latest
    WORKDIR /app
    EXPOSE 80

    COPY --from=build /app/frontend/dist /app
