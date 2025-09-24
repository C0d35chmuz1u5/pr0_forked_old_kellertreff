import { type CreateTableBuilder, sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>) {
  await sql`
      create or replace function update_column_updated_at()
      returns trigger as $$
      begin
        new.updated_at = now();
        return new;
      end;
      $$ language plpgsql;
    `.execute(db);

  // TODO: timestamps/timezone:
  // https://justatheory.com/2012/04/postgres-use-timestamptz/

  await db.schema
    .createTable("user")
    .addColumn("id", "integer", col => col.generatedAlwaysAsIdentity().primaryKey())
    .addColumn("display_name", "text", col => col.notNull().unique())
    .addColumn("auth_api_access_token", "text", col => col.notNull())
    .addColumn("external_id", "text", col => col.notNull())
    .$call(addAuditedTableFields)
    .execute();
  await createTimestampTriggers("user").execute(db);

  await db.schema
    .createTable("user_session")
    .addColumn("id", "integer", col => col.generatedAlwaysAsIdentity().primaryKey())
    .addColumn("user_id", "integer", col => col.notNull().references("user.id").onDelete("cascade"))
    .addColumn("user_agent", "text", col => col.notNull())
    .addColumn("last_used_at", "timestamptz", col =>
      col.defaultTo(sql`current_timestamp`).notNull(),
    )
    .addColumn("token", "text", col => col.notNull().unique())
    .$call(addAuditedTableFields)
    .execute();
  await createTimestampTriggers("user_session").execute(db);

  await db.schema
    .createTable("banned_user")
    .addColumn("id", "integer", col => col.generatedAlwaysAsIdentity().primaryKey())
    .addColumn("external_id_hash", "text", col => col.notNull().unique())
    .addColumn("reason", "text")
    .$call(addAuditedTableFields)
    .execute();
  await createTimestampTriggers("banned_user").execute(db);

  await db.schema
    .createTable("geo_location")
    .addColumn("id", "integer", col => col.generatedAlwaysAsIdentity().primaryKey())
    .addColumn("country_code", "text", col => col.notNull())
    .addColumn("zip_code", "text", col => col.notNull())
    .addColumn("latitude", "real", col => col.notNull())
    .addColumn("longitude", "real", col => col.notNull())
    .$call(addAuditedTableFields)
    .execute();
  await createTimestampTriggers("geo_location").execute(db);

  await db.schema
    .createIndex("geo_location_country_code_zip_code")
    .on("geo_location")
    .columns(["country_code", "zip_code"])
    .unique()
    .execute();

  await db.schema
    .createTable("user_settings")
    .addColumn("id", "integer", col => col.generatedAlwaysAsIdentity().primaryKey())
    .addColumn("user_id", "integer", col =>
      col.notNull().unique().references("user.id").onDelete("cascade"),
    )
    .addColumn("dm_spam_enabled", "boolean", col => col.notNull().defaultTo(true))
    .$call(addAuditedTableFields)
    .execute();
  await createTimestampTriggers("user_settings").execute(db);

  await db.schema
    .createTable("user_filter")
    .addColumn("id", "integer", col => col.generatedAlwaysAsIdentity().primaryKey())
    .addColumn("user_id", "integer", col =>
      col.notNull().unique().references("user.id").onDelete("cascade"),
    )
    .addColumn("age_range_min", "integer")
    .addColumn("age_range_max", "integer")
    .addColumn("distance_max", "integer")
    .addColumn("accepts_male", "boolean", col => col.notNull())
    .addColumn("accepts_female", "boolean", col => col.notNull())
    .addColumn("accepts_other", "boolean", col => col.notNull())
    .$call(addAuditedTableFields)
    .execute();
  await createTimestampTriggers("user_filter").execute(db);

  await db.schema
    .createTable("user_dating_profile")
    .addColumn("id", "integer", col => col.generatedAlwaysAsIdentity().primaryKey())
    .addColumn("user_id", "integer", col =>
      col.notNull().unique().references("user.id").onDelete("cascade"),
    )
    .addColumn("enabled", "boolean", col => col.notNull())
    .addColumn("date_of_birth", "date", col => col.notNull())
    // We cannot store this and postgres does not support computed virtual columns
    // .addColumn("age", "integer", col =>
    //     col.notNull().generatedAlwaysAs(sql`extract(years from age(birthday))`).stored(),
    // )
    .addColumn("gender", "text", col => col.notNull())
    .addColumn("bio", "text", col => col.notNull())
    .addColumn("current_location_id", "integer", col =>
      col.notNull().references("geo_location.id").onDelete("restrict"),
    )
    .addColumn("looking_for", "text", col => col.notNull())
    .addColumn("job_title", "text")
    .addColumn("education", "text")
    // TODO: profile index for age and height
    .addColumn("height_cm", "integer")
    .addColumn("alcohol_consumption", "text")
    .addColumn("smoking_habits", "text")
    .addColumn("discord_id", "text")
    .$call(addAuditedTableFields)
    .execute();
  await createTimestampTriggers("user_dating_profile").execute(db);

  await db.schema
    .createTable("interest")
    .addColumn("id", "integer", col => col.generatedAlwaysAsIdentity().primaryKey())
    .addColumn("name", "text", col => col.notNull().unique())
    .$call(addAuditedTableFields)
    .execute();
  await createTimestampTriggers("interest").execute(db);

  await db.schema
    .createTable("user_dating_profile_interest")
    .addColumn("id", "integer", col => col.generatedAlwaysAsIdentity().primaryKey())
    .addColumn("profile_id", "integer", col =>
      col.notNull().references("user_dating_profile.id").onDelete("cascade"),
    )
    .addColumn("interest_id", "integer", col =>
      col.notNull().references("interest.id").onDelete("cascade"),
    )
    .addColumn("priority", "integer", col => col.notNull())
    .$call(addAuditedTableFields)
    .execute();
  await createTimestampTriggers("user_dating_profile_interest").execute(db);

  await db.schema
    .createTable("user_friends_profile")
    .addColumn("id", "integer", col => col.generatedAlwaysAsIdentity().primaryKey())
    .addColumn("user_id", "integer", col =>
      col.notNull().unique().references("user.id").onDelete("cascade"),
    )
    .addColumn("enabled", "boolean", col => col.notNull())
    .addColumn("bio", "text", col => col.notNull())
    .$call(addAuditedTableFields)
    .execute();
  await createTimestampTriggers("user_friends_profile").execute(db);

  await db.schema
    .createTable("user_friends_interest")
    .addColumn("id", "integer", col => col.generatedAlwaysAsIdentity().primaryKey())
    .addColumn("profile_id", "integer", col =>
      col.notNull().references("user_friends_profile.id").onDelete("cascade"),
    )
    .addColumn("priority", "integer", col => col.notNull())
    .addColumn("content", "text", col => col.notNull())
    .$call(addAuditedTableFields)
    .execute();
  await createTimestampTriggers("user_friends_interest").execute(db);

  await db.schema
    .createTable("user_report")
    .addColumn("id", "integer", col => col.generatedAlwaysAsIdentity().primaryKey())
    .addColumn("reporter_id", "integer", col =>
      col.notNull().references("user.id").onDelete("cascade"),
    )
    .addColumn("reported_user_id", "integer", col =>
      col.notNull().references("user.id").onDelete("cascade"),
    )
    .addColumn("reason", "text")
    .addColumn("closed_at", "timestamptz")
    .$call(addAuditedTableFields)
    .execute();
  await createTimestampTriggers("user_report").execute(db);
}

function createTimestampTriggers(tableName: string) {
  return sql`
      create trigger ${sql.id(`update_column_updated_at_${tableName}`)}
      before update on ${sql.table(tableName)}
      for each row execute procedure update_column_updated_at()
    `;
}

function addAuditedTableFields<T extends string, U extends string>(
  table: CreateTableBuilder<T, U>,
) {
  return table
    .addColumn("created_at", "timestamptz", col => col.defaultTo(sql`current_timestamp`).notNull())
    .addColumn("updated_at", "timestamptz", col => col.defaultTo(sql`current_timestamp`).notNull());
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable("user_report").execute();
  await db.schema.dropTable("friends_interest").execute();
  await db.schema.dropTable("user_friends_profile").execute();
  await db.schema.dropTable("user_dating_profile_interest").execute();
  await db.schema.dropTable("interest").execute();
  await db.schema.dropTable("user_dating_profile").execute();
  await db.schema.dropTable("user_filter").execute();
  await db.schema.dropTable("user_settings").execute();
  await db.schema.dropTable("geo_location").execute();
  await db.schema.dropTable("banned_user").execute();
  await db.schema.dropTable("user_session").execute();
  await db.schema.dropTable("user").execute();
  await sql`drop function update_column_updated_at`.execute(db);
}
