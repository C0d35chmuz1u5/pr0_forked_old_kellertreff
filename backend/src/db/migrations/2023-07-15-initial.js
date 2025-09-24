// @ts-check
import { Kysely, sql } from "kysely";

/**
 * @param {Kysely<any>} db
 * @returns {Promise<void>}
 */
export async function up(db) {
	await sql`
-- SQLite:
-- sqlite3 KT.db < schema.sql
-- sqlite3 KT.db < schema-mock-data.sql

-- You may want to set this in SQLite:
-- .mode column
-- .headers on
-- .nullvalue NULL
-- See: https://dba.stackexchange.com/questions/40656
-- You might want to even put this into your ~/.sqliterc, see: https://stackoverflow.com/a/5240863

  create table if not exists user (
    id integer primary key autoincrement,

    display_name text unique not null,
    api_access_token text, -- we would like to have 'unique not null', but we did not save them for old users
    identifier text, -- we would like to have 'unique not null', but we did not save them for old users

    current_text text not null default '',
    tags text not null default '',

    score integer default 0 not null,
    update_count integer default 0 not null,
    wants_spam boolean default false not null,
    last_activity timestamp default current_timestamp not null, -- when the user changed his profile or created a vote

    -- TODO: Edits remaining

    -- country_code and zip_code are _not_ foreign keys for geo_location
    -- our data may be outdated (zip codes missing), but we don't want to prevent the user from using it
    -- We use in in JOINs, if they are mot mapped to coordinates, it will be the same as not entering something
    country_code text default null,
    zip_code text default null,

    -- Will be incremented once a user explicitly logs out.
    -- -> invalidates every previously issued token of that user
    session_level integer default 0 not null,

    created_at timestamp default current_timestamp not null,
    modified_at timestamp default current_timestamp not null -- when the user changed his profile (or he was renamed)
  );
`.execute(db);
await sql`

create trigger if not exists update_user_last_activity_and_modified_at
after update of wants_spam, current_text, tags on user
begin
    update user
    set
        update_count = new.update_count + 1,
        last_activity = current_timestamp,
        modified_at = current_timestamp
    where id = new.id;
end;
`.execute(db);
await sql`

-- Remove all negative votes as soon as a user updates his profile (tags/text)
create trigger if not exists reset_negative_votes
after update of current_text, tags on user
begin
    delete from vote
    where
        candidate = new.id
        and
        decision = false;
end;
`.execute(db);
await sql`

create table if not exists vote (
    user integer,
    candidate integer,

    decision boolean,
    candidate_text text not null,
    candidate_tags text not null,

    created_at timestamp default current_timestamp not null,
    modified_at timestamp default current_timestamp not null,

    foreign key(user) references user(id) on delete cascade,
    foreign key(candidate) references user(id) on delete cascade,

    primary key (user, candidate)
);
`.execute(db);

await sql`
create index if not exists idx_candidate_vote_user_decision on vote (candidate, decision, user);
`.execute(db);

await sql`
create index if not exists idx_vote_created_at on vote (created_at);
`.execute(db);

await sql`
create trigger if not exists update_vote_modified_at
after update of decision, candidate_text, candidate_tags on vote
begin
    update vote
    set modified_at = current_timestamp
    where
        user = new.user
        and
        candidate = new.candidate;
end;
`.execute(db);

await sql`
create trigger if not exists increment_user_score
after insert on vote
begin
    update user
    set score = score + 1
    where id = new.user;
end;
`.execute(db);

await sql`
-- TODO: Use this match table. Maybe we just want to alter the user_notification table
-- TODO: Fill match table when second vote is inserted
create table if not exists match (
    user integer,
    partner integer,
    sent_notification boolean not null,

    partner_text text not null,
    partner_tags text not null,

    created_at timestamp default current_timestamp not null,
    modified_at timestamp default current_timestamp not null,

    foreign key(user) references user(id) on delete cascade,
    foreign key(partner) references user(id) on delete cascade,

    primary key (user, partner)
);
`.execute(db);

await sql`
create table if not exists user_notification (
    user integer,
    partner integer,
    sent boolean,
    -- TODO: not null

    created_at timestamp default current_timestamp not null,
    modified_at timestamp default current_timestamp not null,

    foreign key(user) references user(id) on delete cascade,
    foreign key(partner) references user(id) on delete cascade,

    primary key (user, partner)
);
`.execute(db);

await sql`
create trigger if not exists update_user_notification_modified_at
after update of user, partner, sent on user_notification
begin
    update user_notification
    set modified_at = current_timestamp
    where user = new.user and partner = new.partner;
end;
`.execute(db);

await sql`
create table if not exists spam_notification (
    user integer,
    amount integer not null,

    created_at timestamp default current_timestamp not null,
    modified_at timestamp default current_timestamp not null,

    foreign key(user) references user(id) on delete cascade,
    primary key (user)
);
`.execute(db);

await sql`
create trigger if not exists update_spam_notification_modified_at
after update of user, amount on spam_notification
begin
    update spam_notification
    set modified_at = current_timestamp
    where user = new.user;
end;
`.execute(db);

await sql`
create table if not exists banned_user (
    id integer primary key autoincrement,
    pr0gramm_id_hash text unique not null,

    created_at timestamp default current_timestamp not null,
    modified_at timestamp default current_timestamp not null
);
`.execute(db);

await sql`
create trigger if not exists update_banned_user_modified_at
after update of id, pr0gramm_id_hash on banned_user
begin
    update banned_user
    set modified_at = current_timestamp
    where id = new.id;
end;
`.execute(db);

await sql`
create table if not exists geo_location (
    country_code text not null,
    zip_code text not null check(4 <= length(zip_code) and length(zip_code) <= 6),
    latitude real not null,
    longitude real not null,

    primary key (country_code, zip_code)
);
`.execute(db);

await sql`
create view if not exists complete_profile
as
    select *
    from user
    where
        current_text is not null
        and
        current_text != ''
        and
        tags is not null
        and
        tags != '';
`.execute(db);

await sql`
-- Ref: https://www.vivekkalyan.com/splitting-comma-seperated-fields-sqlite
create view if not exists user_with_tag
as
    with recursive split(id, tag, str) as (
        select id, '', tags || ',' FROM user
        union all select
        id,
        substr(str, 0, instr(str, ',')),
        substr(str, instr(str, ',') + 1)
        from split where str != ''
    )
    select id, lower(tag) as tag
    from split
`.execute(db);

await sql`
create view if not exists user_with_outstanding_upvotes
as
    select
        u.id as user,
        u.display_name as display_name,
        u.last_activity as last_activity,
        count(v.user) as outstanding_upvotes
    from
        vote v
        join
        complete_profile u
        on v.candidate = u.id
    where
        u.wants_spam = true
        and
        v.decision = true
        and
        0 == (
            select count(*)
            from vote vs
            where
                vs.user = u.id
                and
                vs.candidate = v.user
        )
    group by u.id, u.display_name;
`.execute(db);
}

/**
 * @param {Kysely<any>} db
 * @returns {Promise<void>}
 */
export async function down(db) {
	await db.schema.dropTable("user").execute();
	await db.schema.dropView("user_with_tag").execute();
	await db.schema.dropView("user_with_outstanding_upvotes").execute();
	await db.schema.dropView("complete_profile").execute();
	await db.schema.dropTable("geo_location").execute();
}
