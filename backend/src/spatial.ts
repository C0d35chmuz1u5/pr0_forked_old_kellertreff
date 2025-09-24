export type Latitude = number;
export type Longitude = number;

export interface GeoPoint {
	latitude: Latitude;
	longitude: Longitude;
}
export function isGeoPoint(v: unknown): v is GeoPoint {
	return (
		!!v &&
		typeof v === "object" &&
		typeof (v as Partial<GeoPoint>).latitude === "number" &&
		typeof (v as Partial<GeoPoint>).longitude === "number"
	);
}

/** in km */
const EARTH_RADIUS = 6371;

/**
 * @remarks We might want to do this directly in the database (or define a DB extension function that does this calculation)
 * @returns Distance between p0 and p1 in km.
 * Ref: https://stackoverflow.com/q/18883601 (adapted to the current project)
 * See also: https://en.wikipedia.org/wiki/Haversine_formula
 */
export function getDistanceBetween(p0: GeoPoint, p1: GeoPoint) {
	const deltaLat = degreesToRadian(p1.latitude - p0.latitude);
	const deltaLon = degreesToRadian(p1.longitude - p0.longitude);

	const a =
		Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
		Math.cos(degreesToRadian(p0.latitude)) *
			Math.cos(degreesToRadian(p1.latitude)) *
			Math.sin(deltaLon / 2) *
			Math.sin(deltaLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return EARTH_RADIUS * c;
}

function degreesToRadian(deg: number) {
	return deg * (Math.PI / 180);
}

// Maybe put them into the database some day

//#region Locations

const cities = [
	"Aachen",
	"Altona",
	"Augsburg",
	"Barmen",
	"Bergisch Gladbach",
	"Berlin",
	"Bielefeld",
	"Bochum",
	"Bonn",
	"Bottrop",
	"Braunschweig",
	"Bremen",
	"Bremerhaven",
	"Buer",
	"Charlottenburg",
	"Chemnitz",
	"Cottbus",
	"Darmstadt",
	"Dessau-Roßlau",
	"Dortmund",
	"Dresden",
	"Duisburg",
	"Düsseldorf",
	"Elberfeld",
	"Erfurt",
	"Erlangen",
	"Essen",
	"Flensburg",
	"Frankfurt am Main",
	"Freiburg im Breisgau",
	"Fürth",
	"Gelsenkirchen",
	"Gera",
	"Görlitz",
	"Göttingen",
	"Gütersloh",
	"Hagen",
	"Halle",
	"Hamborn",
	"Hamburg",
	"Hamm",
	"Hannover",
	"Harburg-Wilhelmsburg",
	"Heidelberg",
	"Heilbronn",
	"Herne",
	"Hildesheim",
	"Ingolstadt",
	"Jena",
	"Kaiserslautern",
	"Karlsruhe",
	"Kassel",
	"Kiel",
	"Koblenz",
	"Krefeld",
	"Köln",
	"Lahn",
	"Leipzig",
	"Leverkusen",
	"Lichtenberg",
	"Ludwigshafen am Rhein",
	"Lübeck",
	"Magdeburg",
	"Mainz",
	"Mannheim",
	"Mecklenburg-Vorpommern",
	"Moers",
	"Mönchengladbach",
	"Mülheim an der Ruhr",
	"München",
	"Münster",
	"Neuss",
	"Niedersachsen",
	"Nordrhein-Westfalen",
	"Nürnberg",
	"Oberhausen",
	"Offenbach am Main",
	"Oldenburg",
	"Osnabrück",
	"Paderborn",
	"Pforzheim",
	"Plauen",
	"Potsdam",
	"Recklinghausen",
	"Regensburg",
	"Remscheid",
	"Reutlingen",
	"Rheinland-Pfalz",
	"Rheydt",
	"Rixdorf",
	"Rostock",
	"Saarbrücken",
	"Sachsen-Anhalt",
	"Salzgitter",
	"Schleswig-Holstein",
	"Schwerin",
	"Schöneberg",
	"Siegen",
	"Solingen",
	"Spandau",
	"Stuttgart",
	"Trier",
	"Ulm",
	"Wanne-Eickel",
	"Wiesbaden",
	"Wilhelmshaven",
	"Wilmersdorf",
	"Witten",
	"Wolfsburg",
	"Wuppertal",
	"Würzburg",
	"Zwickau",
];

const states = [
	"Baden-Württemberg",
	"Bayern",
	"Berlin",
	"Brandenburg",
	"Bremen",
	"Hamburg",
	"Hessen",
	"Mecklenburg-Vorpommern",
	"Niedersachsen",
	"Nordrhein-Westfalen",
	"Rheinland-Pfalz",
	"Saarland",
	"Sachsen",
	"Sachsen-Anhalt",
	"Schleswig-Holstein",
	"Thüringen",
];

export const locations = [...cities, ...states].map(c => c.trim().toLocaleLowerCase());

export const statesShort = [
	"BW",
	"BY",
	"BE",
	"BB",
	"HB",
	"HH",
	"HE",
	"MV",
	"NI",
	"NW",
	"RP",
	"SL",
	"SN",
	"SH",
	"ST",
].map(c => c.trim().toLocaleLowerCase());

//#endregion
