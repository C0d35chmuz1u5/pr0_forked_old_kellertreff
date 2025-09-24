# syntax=docker/dockerfile:1
# check=error=true

FROM python:3.13-alpine AS dependencies
    WORKDIR /app

    COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

    # ARM builds may require some custom compilation stuff
    RUN apk add --quiet --update \
        alpine-sdk libffi-dev

    RUN --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
        --mount=type=bind,source=uv.lock,target=uv.lock \
        --mount=type=cache,target=/tmp/cache \
        uv sync --frozen

FROM python:3.13-alpine
    WORKDIR /app
    ENV PATH="/app/.venv/bin:$PATH"

    COPY --from=dependencies /app/.venv /app/.venv
    COPY . /app

    ENTRYPOINT ["python", "-u", "main.py"]

