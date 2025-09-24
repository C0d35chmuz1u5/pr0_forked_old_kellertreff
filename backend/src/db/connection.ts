import { fileURLToPath } from "node:url";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import { Kysely, type LogEvent, SqliteDialect, Migrator, FileMigrationProvider } from "kysely";
import SqliteDatabase, { type Database as SqliteDb } from "better-sqlite3";

import type { Database, KtDatabase } from "./model.js";
import { pairability } from "../matching.js";
import log from "../log.js";

let db: SqliteDb;
let kysely: KtDatabase;
export default () => kysely;

export async function connectToDb(fileName: string): Promise<void> {
	console.assert(!db);

	db = new SqliteDatabase(fileName);
	kysely = new Kysely<Database>({
		dialect: new SqliteDialect({
			database: db,
		}),
		log(event: LogEvent) {
			switch (event.level) {
				case "error":
					log.error(event, "Error running query");
					break;
				case "query":
					log.debug(event, "DB Query");
					break;
			}
		},
	});

	// See: https://github.com/JoshuaWise/better-sqlite3/blob/master/docs/performance.md#performance
	db.pragma("journal_mode = WAL");

	// SQLite needs to have this option to actually delete rows with foreign keys, see: https://dba.stackexchange.com/q/241726
	db.pragma("foreign_keys = ON");

	db.function(
		"pairability",
		{
			varargs: false,
			deterministic: false,
			safeIntegers: false,
		},
		pairability as (...params: unknown[]) => unknown,
	);

	await runMigrationsIfNeeded(kysely);
}

export async function disconnectFromDb(): Promise<void> {
	db.close();
}

export function vacuum() {
	return db.prepare("VACUUM").run();
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
				log.error("Migration %s failed.", e.migrationName);
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
