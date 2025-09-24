import * as redis from "redis";

import config from "./config.js";

const redisClient = redis.createClient({
	url: config.redis.url,
});

export function connectToRedis() {
	return redisClient.connect();
}

export function disconnectFromRedis() {
	return redisClient.disconnect();
}

export function getClient() {
	return redisClient;
}
