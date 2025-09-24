#!/usr/bin/env python3

import os
import time
import sqlite3
from datetime import datetime
import json
import redis
import requests

def main():
    DB_PATH = os.environ['DB_PATH']

    print('Metadata-Updater 2000')
    print(f'SQLite Version: {sqlite3.sqlite_version}')
    print(f'       DB_PATH: {DB_PATH}')

    r = redis.Redis.from_url(os.environ['REDIS_URL'])

    with sqlite3.connect(DB_PATH) as connection:
        cur = connection.cursor()
        cur.execute('pragma foreign_keys = on')
        users_to_update = cur.execute("""
            SELECT id, display_name, api_access_token, identifier
            FROM user
            WHERE api_access_token IS NOT NULL
        """)

        new_names = []
        added_identifiers = []
        api_tokens_to_remove = []

        for user_id, display_name, api_key, identifier in users_to_update:
            headers = create_request_headers(api_key)

            response = requests.get("https://pr0gramm.com/api/user/name", headers=headers)
            if response.ok:
                data = response.json()

                possible_new_name = data.get('name')
                if possible_new_name != display_name:
                    new_names.append((user_id, possible_new_name))
                    print(f'Caught rename: {display_name} -> {possible_new_name}')

                # this only makes sense when fetching the username did not fail (maybe that was because the user does not exist any more)
                if identifier is None:
                    response = requests.get("https://pr0gramm.com/api/user/identifier", headers=headers)
                    data = response.json()
                    missing_identifier = data.get('identifier')
                    added_identifiers.append((user_id, missing_identifier))
                    print(f'Got new ID for {display_name}: {missing_identifier}')

            else:
                data = response.json()
                if response.status_code == 403 and data.get('msg') == "Invalid access token":
                    print(f'Access token invalid for user {display_name}, setting to null because its useless')
                    api_tokens_to_remove.append(user_id)
                else:
                    print(f'Got a weird response: {response.reason}')

            time.sleep(1)

        print(f'new names: {new_names}')
        print(f'added identifiers: {added_identifiers}')
        print(f'invalid API tokens: {api_tokens_to_remove}')

        print(f'Updated {connection.total_changes} users :)')

        # WHERE ... IN with prepared statements os weird: https://stackoverflow.com/questions/1309989
        # ...so we do it the hard way

        for user_id in api_tokens_to_remove:
            cur.execute(
                """
                    UPDATE user
                    SET api_access_token = NULL
                    WHERE id = ?
                """,
                (user_id, ),
            )

        for user_id, pr0gramm_identifier in added_identifiers:
            cur.execute(
                """
                    UPDATE user
                    SET identifier = ?
                    WHERE id = ?
                """,
                (pr0gramm_identifier, user_id),
            )

        for user_id, new_name in new_names:
            cur.execute(
                """
                    UPDATE user
                    SET display_name = ?
                    WHERE id = ?
                """,
                (new_name, user_id),
            )

        connection.commit()

        message = {
            'originator': 'update-metadata',
            'recipient': 'holzmaster',
            'kind': 'info',
            'message': f"""
Metadata-Updater 2000 hat gerade
- {len(api_tokens_to_remove)} API-Tokens entfernt
- {len(added_identifiers)} Identifier hinzugefügt
- {len(new_names)} Namen geändert.

Insgesamt gab es {connection.total_changes} Änderungen.

{datetime.now().isoformat()}
""".strip(),
            'attempt': 0
        }
        r.rpush('notification', json.dumps(message))


def create_request_headers(api_key):
    return {
        'pr0-api-key': api_key,
    }

if __name__ == '__main__':
    main()
