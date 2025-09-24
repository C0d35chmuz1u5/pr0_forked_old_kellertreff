import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import { startInactiveSpan, captureException } from "@sentry/bun";
import pg from "pg";
import { FileMigrationProvider, Kysely, Migrator, PostgresDialect, sql } from "kysely";

import type { Database } from "./model.js";
import config from "../config.js";
import log from "../log.js";

let kysely: Kysely<Database>;

export default () => kysely;

export async function connectToDb() {
  const db = new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new pg.Pool({ connectionString: config.databaseUrl(), max: 30 }),
    }),
    log: e => {
      const info = {
        sql: e.query.sql,
        params: e.query.parameters,
        duration: e.queryDurationMillis,
      };
      switch (e.level) {
        case "error":
          captureException(e.error);
          log.error(info, "Error running query");
          break;
        case "query":
          startInactiveSpan({
            name: info.sql,
            op: "db.query",
            startTime: new Date(Date.now() - info.duration),
          }).end();

          log.debug(info, "DB Query");
          break;
        default:
          return; // TODO: assertNever(e.level);
      }
    },
  });

  log.info("Connected to database.");

  await runMigrationsIfNeeded(db);

  kysely = db;
}

export async function disconnectFromDb() {
  log.info("Disconnecting from database...");

  await kysely?.destroy();
  kysely = undefined as unknown as Kysely<Database>;
}

async function runMigrationsIfNeeded(db: Kysely<Database>) {
  const migrationFolder = fileURLToPath(new URL("./migrations", import.meta.url).toString());

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({ fs, path, migrationFolder }),
  });

  const allMigrations = await migrator.getMigrations();
  const pendingMigrations = allMigrations.filter(m => !m.executedAt).length;

  if (pendingMigrations > 0) {
    log.info("Running %d migrations.", pendingMigrations);

    const { error, results } = await migrator.migrateToLatest();
    const errors = results?.filter(r => r.status === "Error");
    if (errors) {
      for (const e of errors) {
        log.error("Migration %s failed", e.migrationName);
      }
    }

    if (error) {
      log.error("Failed to migrate. Exiting.");
      log.error(error);
      process.exit(1);
    }

    log.info("Migrations done.");
  }
}

export async function getStatus(): Promise<boolean> {
  const db = kysely;
  if (!db) {
    return false;
  }
  const result = (await sql`select 'connected' as status`.execute(db)) as {
    rows: { status: string }[];
  };
  return result.rows[0]?.status === "connected";
}
