FROM alpine
    RUN apk add jq bash sqlite curl unzip

    COPY . .
    ENTRYPOINT [ "./update-locations.sh" ]
