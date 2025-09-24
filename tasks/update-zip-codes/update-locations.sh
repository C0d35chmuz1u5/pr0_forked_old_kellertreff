#!/usr/bin/env bash

set -xeou pipefail

BASE="https://raw.githubusercontent.com/zauberware/postal-codes-json-xml-csv/master/data"

URL_DE="${BASE}/DE.zip"
URL_CH="${BASE}/CH.zip"
URL_AT="${BASE}/AT.zip"

filter_data() {
    jq -r ". | map([(.country_code | ascii_upcase), .zipcode, .latitude, .longitude] | join(\"\t\")) | join(\"\n\")"
}

curl -O "${URL_DE}"
unzip "DE.zip"
cat zipcodes.de.json | filter_data > de.tsv

curl -O "${URL_AT}"
unzip "AT.zip"
cat zipcodes.at.json | filter_data > at.tsv

curl -O "${URL_CH}"
unzip "CH.zip"
cat zipcodes.ch.json | filter_data > ch.tsv

sqlite3 "${DB_PATH}" <<SQL
begin transaction;

create temporary table temp_geo_location (
    country_code text not null,
    zip_code text not null check(4 <= length(zip_code) and length(zip_code) <= 6),
    latitude real not null,
    longitude real not null
);

.separator "\t"
.import de.tsv temp_geo_location
.import ch.tsv temp_geo_location
.import at.tsv temp_geo_location

delete from geo_location;

insert into geo_location (country_code, zip_code, latitude, longitude)
select
    country_code, zip_code, avg(latitude), avg(longitude)
    from temp_geo_location
    group by country_code, zip_code;

end transaction;
SQL

rm de.tsv ch.tsv at.tsv
