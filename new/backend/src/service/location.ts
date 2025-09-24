import type { CountryCode } from "@/shared/src/api-types.js";

import db from "@db";

export async function getAllLocations() {
  const allLocations = await db()
    .selectFrom("geo_location")
    .select(["id", "country_code", "zip_code"])
    .execute();

  const grouped = Object.groupBy(allLocations, row => row.country_code);
  const res: Partial<Record<CountryCode, { id: number; zipCode: string }[]>> = {};
  for (const [countryCode, locations] of Object.entries(grouped)) {
    res[countryCode as CountryCode] = locations.map(row => ({
      id: row.id,
      zipCode: row.zip_code,
    }));
  }

  return res;
}

export async function addLocation(
  country: CountryCode,
  zipCode: string,
  latitude: number,
  longitude: number,
) {
  return await db()
    .insertInto("geo_location")
    .values({
      country_code: country,
      zip_code: zipCode,
      latitude,
      longitude,
    })
    .onConflict(oc => oc.columns(["country_code", "zip_code"]).doUpdateSet({ latitude, longitude }))
    .returningAll()
    .executeTakeFirstOrThrow();
}
