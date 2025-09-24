create view positive_vote
as
	select
		user, candidate
	from vote
	where decision = true;

create view match_unprocessed
as
	select distinct
		a.user as user,
		a.candidate as candidate
	from positive_vote a
	left join positive_vote b
		on a.candidate = b.user
	where
		b.candidate = a.user
		and
		a.candidate = b.user;

create view matched_user_unprocessed
as
	select
		m.user as user_id,
		f.display_name as user_name,
		m.candidate as partner_id,
		s.display_name as partner_name
	from match_unprocessed m
	join user f
		on f.id = m.user
	join user s
		on s.id = m.candidate;

create view tag_stats
as
	select
		tag,
		count(1) as occurrences
	from user_with_tag
	group by lower(tag)
	having count(1) >= 2
	order by count(tag) desc;
