import { PostgreSqlContainer } from "@testcontainers/postgresql";

import { connectToDb, disconnectFromDb } from "./index.js";

export default async function createDatabase() {
  const pg = await new PostgreSqlContainer("postgres:16-alpine").withDatabase("app").start();

  process.env.DATABASE_URL = pg.getConnectionUri();

  await connectToDb();

  return async () => {
    await disconnectFromDb();
    await pg.stop();
  };
}
