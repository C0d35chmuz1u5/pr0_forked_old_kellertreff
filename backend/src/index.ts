import log from "./log.js";
import { initSentry } from "./tracking.js";
import { connectToDb, disconnectFromDb } from "./db/index.js";
import { startServer, stopServer } from "./server.js";
import { connectToRedis, disconnectFromRedis } from "./redis.js";
import config from "./config.js";

log.info("Starting...");

initSentry();
await connectToRedis();
await connectToDb(config.db.path);
await startServer();

async function closeGracefully(signal: string) {
	log.fatal(`Received ${signal}. Closing gracefully...`);
	await stopServer();
	// Needs to be closed last, so that all other operations can finish
	await disconnectFromDb();
	await disconnectFromRedis();

	process.kill(process.pid, signal);
}

process.once("SIGINT", closeGracefully);
process.once("SIGTERM", closeGracefully);

log.info("Application startup completed. Waiting for stuff to happen.");

/*
if (process.env.NODE_ENV !== "production") {
    db.user.getAll().then((users) => {
        console.table(users.map((u) => ({ id: u.id, name: u.display_name })));
    });
}
*/
