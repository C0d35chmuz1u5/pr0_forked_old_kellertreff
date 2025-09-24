# db migrations

Use JS here, as the tests run here and tey won't compile TS.

Template:

```js
// @ts-check
import { Kysely, sql } from "kysely";

/**
 * @param {Kysely<any>} db
 * @returns {Promise<void>}
 */
export async function up(db) {
  // await db.schema
  //   .createTable("test")
  //   .addColumn("id", "serial", col => col.primaryKey())
  //   .execute();
}

/**
 * @param {Kysely<any>} db
 * @returns {Promise<void>}
 */
export async function down(db) {
  // await db.schema.dropTable("test").execute();
}
```
