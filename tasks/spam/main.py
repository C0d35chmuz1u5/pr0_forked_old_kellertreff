#!/usr/bin/env python3

import os
import random
import sqlite3
from datetime import datetime
import json
import redis


MIN_INACTIVE_DAYS = 30
MIN_DAYS_SINCE_LAST_NOTIFICATION = 7
CANDIDATES_TO_CONSIDER = 100
VOTE_LINK = 'https://kellertreff.com'

# TODO: Remove WHERE id = 1 AND decision = true

def main():
    DB_PATH = os.environ['DB_PATH']

    print('Spammer 1000')
    print(f'SQLite Version: {sqlite3.sqlite_version}')
    print(f'       DB_PATH: {DB_PATH}')

    r = redis.Redis.from_url(os.environ['REDIS_URL'])

    with sqlite3.connect(DB_PATH) as connection:
        cur = connection.cursor()
        cur.execute('pragma foreign_keys = on')

        all_spam_candidates = cur.execute(
            """
                SELECT
                    u.user as id,
                    u.display_name as name,
                    u.outstanding_upvotes as votes
                FROM
                    user_with_outstanding_upvotes u
                    LEFT JOIN
                    spam_notification sn
                    ON u.user = sn.user
                WHERE
                    (JULIANDAY('now') - JULIANDAY(u.last_activity)) >= :min_inactive_days
                    AND
                    (
                        sn.modified_at IS NULL
                        OR
                        (JULIANDAY('now') - JULIANDAY(sn.modified_at)) >= :min_days_since_last_notification
                    )
                    AND
                    u.user NOT IN (
                        SELECT candidate
                        FROM vote
                        WHERE user = 1 AND decision = true
                    )
                ORDER BY u.last_activity, u.outstanding_upvotes ASC;
            """, {
                'min_inactive_days': MIN_INACTIVE_DAYS,
                'min_days_since_last_notification': MIN_DAYS_SINCE_LAST_NOTIFICATION,
            },
        )

        all_spam_candidates = list(all_spam_candidates)
        spam_candidates = random.sample(
            all_spam_candidates,
            min(len(all_spam_candidates), CANDIDATES_TO_CONSIDER)
        )

        for user_id, name, votes in spam_candidates:
            print(f'Processing {user_id}: {name} with {votes} votes')
            msg = create_message(name, votes)
            send_message(r, 'spam-service', name, 'info', msg)
            mark_as_notified(cur, user_id, votes)

        print(f'Marked {connection.total_changes} as notified :)')

        send_message(r, 'spam', 'holzmaster', 'info', f'Spammer 1000 hat gerade {len(spam_candidates)} User benachrichtigt 👋\n\n{datetime.now().isoformat()}')


def send_message(r, originator, recipient, kind, payload):
    message = {
        'originator': originator,
        'recipient': recipient,
        'kind': kind,
        'message': payload,
        'attempt': 0,
    }
    # print('Sending to: ' + recipient)
    # print(payload)
    # print()
    r.rpush('notification', json.dumps(message))


def create_message(name: str, votes: int):
    s = None
    if votes == 1:
        s = { 'have': 'hat', 'h': 'Mensch', 'it': 'den' }
    else:
        s = { 'have': 'haben', 'h': 'Menschen', 'it': 'die' }

    return f"""
Hallo {name}!

Dir {s['have']} auf Kellertreff {votes} {s['h']} einen Upvote gegeben, auf {s['it']} du bisher nicht reagiert hast. Stimme jetzt ab und finde heraus, wer es war!
Vielleicht ist ja Jemand für Dich dabei?

Hier kannst Du voten: {VOTE_LINK}

Dein Kellertreff
P.S.: Du bekommst diese Nachricht, weil du "Erweiterte Benachrichtigungen" aktiviert hast.
P.P.S.: Man kann jetzt auch eine Postleitzahl angeben!
""".strip()


def mark_as_notified(cur, user_id: int, votes: int):
    cur.execute(
        """
            INSERT INTO
            spam_notification (user, amount)
            VALUES
                (:user, :amount)
            ON CONFLICT (user)
                DO UPDATE
                SET amount = :amount
        """, {
            'user': user_id,
            'amount': votes,
        },
    )


if __name__ == '__main__':
    main()
