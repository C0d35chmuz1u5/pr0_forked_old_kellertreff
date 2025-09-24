// @ts-check
import { Kysely, sql } from "kysely";

/**
 * @param {Kysely<any>} db
 * @returns {Promise<void>}
 */
export async function up(db) {
    await db.schema.createTable("tag_assignment")
        .addColumn("id", "integer", c => c.primaryKey().autoIncrement())
        .addColumn("user", "integer", c => c.notNull())
        .addColumn("tag", "text", c => c.notNull())
        .addColumn("created_at", "timestamp", c => c.notNull().defaultTo(sql`current_timestamp`))
        .addForeignKeyConstraint("user_tag", ["user"], "user", ["id"], (cb) => cb.onDelete('cascade'))
        .execute();

    await db.schema
        .createIndex("idx_tag_assignment_tag_user")
        .on("tag_assignment")
        .columns(["tag", "user"])
        .unique()
        .execute();

    // SQLite doesn't create an index for FOREIGN KEY constraints, so we need to create it manually
    await db.schema
        .createIndex("idx_tag_assignment_user")
        .on("tag_assignment")
        .column("user")
        .execute();

    await db.schema.dropView("complete_profile").execute();
    await sql`
    create view complete_profile
    as
        select *
        from user
        where
            current_text is not null
            and
            current_text != ''
            and
            (select count(*) from tag_assignment ta where ta.user = user.id) > 0;
    `.execute(db);

    await db.schema.dropView("user_with_tag").execute();
    await sql`
    create view user_with_tag
    as
        select user as id, tag from tag_assignment;
    `.execute(db);


    await db.schema.alterTable("vote")
        .dropColumn("candidate_tags")
        .execute();

    const usersWithTags = await db.selectFrom("user")
        .select(["id", "tags"])
        .execute();

    for (const user of usersWithTags) {
        if (user.tags === null || user.tags === "") {
            continue;
        }

        // @ts-ignore
        const tags = user.tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);

        for (const tag of tags) {
            await db.insertInto("tag_assignment")
                .values({
                    user: user.id,
                    tag: tag
                })
                .execute();
        }
    }

    await db.schema.alterTable("user")
        .dropColumn("tags")
        .execute();
}

/**
 * @param {Kysely<any>} db
 * @returns {Promise<void>}
 */
export async function down(db) {
    await db.schema.dropTable("tag_assignment").execute();
}
