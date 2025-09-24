#!/usr/bin/env python3

import os
import sqlite3
from datetime import datetime
import json
import redis


def main():
    DB_PATH = os.environ['DB_PATH']

    grace_period_in_days = 14

    print('Karteileichen-Remover 3000')
    print(f'SQLite Version: {sqlite3.sqlite_version}')
    print(f'       DB_PATH: {DB_PATH}')
    print(f'  Grace period: {grace_period_in_days} days')

    r = redis.Redis.from_url(os.environ['REDIS_URL'])

    with sqlite3.connect(DB_PATH) as connection:
        # Technically, we only delete users that don't have any other entries in the database.
        # But we want to be sure that some future dev doesn't add entries to inactive users.
        # -> So we make sure that foreign key references to that user are also deleted.
        connection.execute('pragma foreign_keys = on')
        connection.execute("""
                DELETE FROM user
                WHERE
                    (current_text IS NULL OR current_text == '')
                    AND
                    (JULIANDAY('now') - JULIANDAY(last_activity)) >= ?
                    AND
                    id NOT IN (
                        SELECT DISTINCT user
                        FROM tag_assignment
                    )
                    AND
                    id NOT IN (
                        SELECT DISTINCT user
                        FROM vote
                    )
            """,
            (grace_period_in_days, )
        )
        # Not supported by the python3 sqlite3 module :(
        # RETURNING
        #     id,
        #     display_name,
        #     (JULIANDAY('now') - JULIANDAY(last_activity)) as inactive_days

        # If we have this some day, we might want to do this:
        # removed.sort((a, b) => a.inactive_days - b.inactive_days);
        # avgInactivity = removed.reduce((s, u) => s + u.inactive_days, 0) / removed.length;
        # medianInactivity = removed[(removed.length / 2) | 0];

        connection.commit()

        print(f'Deleted {connection.total_changes} users 👋')

        message = {
            'originator': 'prune-inactive-users',
            'recipient': 'holzmaster',
            'kind': 'info',
            'message': f'Karteileichen-Remover 3000 hat gerade {connection.total_changes} User verabschiedet 👋\n\n{datetime.now().isoformat()}',
            'attempt': 0
        }
        r.rpush('notification', json.dumps(message))


if __name__ == '__main__':
    main()
