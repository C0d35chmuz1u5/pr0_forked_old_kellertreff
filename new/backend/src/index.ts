import log from "./log.js";
import { startApi } from "@/api/index.js";
import { connectToDb, disconnectFromDb } from "@/db/index.js";
import { initSentry } from "@/sentry.js";
import config from "@/config.js";
import * as terminal from "@/service/terminal.js";

{
  const prodMode =
    process.env.NODE_ENV === "production" ? terminal.highlightWarn(" prod mode ") : "";

  const kt = terminal.highlight(" kellertreff ");

  console.log();
  console.log(` ${kt} ${prodMode} ${config.release ? ` │ ${config.release}` : ""}`);
  console.log();

  log.info(`Application starting up...${config.release ? ` (release: ${config.release})` : ""}`);
}

await initSentry();
await connectToDb();
await startApi();

async function closeGracefully(signal: string) {
  log.fatal(`Received ${signal}. Closing gracefully...`);

  // Needs to be closed last, so that all other operations can finish
  await disconnectFromDb();

  process.kill(process.pid, signal);
}

process.once("SIGINT", closeGracefully);
process.once("SIGTERM", closeGracefully);

log.info("Application startup completed. Waiting for stuff to happen.");
