-- When change of vote was added:
alter table vote
add column
	modified_at timestamp default '...' not null;

-- SQLite does not support altering tables with non-const default values (it interpretes current_timestamp as the time the table was altered, not as a constraint)
-- Solution: adjust the schema directly, see: https://stackoverflow.com/a/25917323
PRAGMA writable_schema = on;

UPDATE sqlite_master
SET sql = replace(sql,
			"modified_at timestamp default '...' not null",
			"modified_at timestamp default current_timestamp not null"
		)
WHERE type = 'table'
  AND name = 'vote';

PRAGMA writable_schema = off;

update vote
set modified_at = created_at;
create index idx_candidate_vote_user_decision on vote (candidate, decision, user);

-- (re-mount DB after that)

-- When the score was added:
alter table user
add column
	score integer default 0 not null;

update user
set score = (
	select count(1)
	from vote v
	where v.user = user.id
);

-- When the wants_spam was added:
alter table user
add column
	wants_spam boolean default false not null;

create index idx_wants_spam on user (wants_spam);

-- When the last_activity was added:
alter table user
add column
	last_activity timestamp default '...' not null;

pragma writable_schema = on;
update sqlite_master
set sql = replace(sql,
			"last_activity timestamp default '...' not null",
			"last_activity timestamp default current_timestamp not null"
	)
where
	type = 'table'
	and name = 'user';
pragma writable_schema = off;

update user
set last_activity = modified_at;

alter table user
add column
	update_count integer default 0 not null;

create trigger update_user_last_activity_and_modified_at
after update of wants_spam, current_text, tags, score on user
begin
	update user
	set
		update_count = new.update_count + 1,
		last_activity = current_timestamp,
		modified_at = current_timestamp
	where id = new.id;
end;

create trigger update_vote_modified_at
after update of decision, candidate_text, candidate_tags on vote
begin
	update vote
	set modified_at = current_timestamp
	where
		user = new.user
		and
		candidate = new.candidate;
end;

create trigger update_user_notification_modified_at
after update of user, partner, sent on user_notification
begin
	update user_notification
	set modified_at = current_timestamp
	where user = new.user and partner = new.partner;
end;

alter table user
add column
	country_code text default null;

alter table user
add column
	zip_code text default null check(4 <= length(zip_code) and length(zip_code) <= 6);


alter table user
add column
	identifier text;

alter table user
add column
	api_access_token text;

create trigger reset_negative_votes
after update of current_text, tags on user
begin
	delete from vote
	where
		candidate = new.id
		and
		decision = false;
end;

create trigger increment_user_score
after insert on vote
begin
	update user
	set score = score + 1
	where id = new.user;
end;

create table spam_notification (
	user integer,
	amount integer not null,

	created_at timestamp default current_timestamp not null,
	modified_at timestamp default current_timestamp not null,

	foreign key(user) references user(id) on delete cascade,
	primary key (user)
);

create trigger update_spam_notification_modified_at
after update of user, amount on spam_notification
begin
	update spam_notification
	set modified_at = current_timestamp
	where user = new.user;
end;

create table banned_user (
	id integer primary key autoincrement,
	pr0gramm_id_hash text unique not null,

	created_at timestamp default current_timestamp not null,
	modified_at timestamp default current_timestamp not null
);
create unique index idx_banned_user_hash on banned_user (pr0gramm_id_hash);
create trigger update_banned_user_modified_at
after update of id, pr0gramm_id_hash on banned_user
begin
	update banned_user
	set modified_at = current_timestamp
	where id = new.id;
end;

create table geo_location (
	country_code text not null,
	zip_code text not null check(4 <= length(zip_code) and length(zip_code) <= 6),
	latitude real not null,
	longitude real not null,

	primary key (country_code, zip_code)
);

-- TODO: We cannot add unique columns
-- ...as well as non-null columns with no default value
-- alter table user
-- add column
-- 	api_access_token text unique not null;
