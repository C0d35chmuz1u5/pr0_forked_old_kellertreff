import { useState } from "react";
import { isCountryCode, isZipCode } from "@/shared/types";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

import type { GeoLocation } from "@/shared/typebox";
import { MapPinIcon } from "@/icons";

import styles from "./GeoLocationInput.module.scss";

export type GeoLocationInputProps = {
	value: GeoLocation | null;
	onChange: (newValue: GeoLocation | null) => void;
};

const NO_COUNTRY_CODE = "none";

export default function GeoLocationInput(props: GeoLocationInputProps) {
	const [countryCode, setCountryCode] = useState<string>(
		props.value?.countryCode ?? NO_COUNTRY_CODE,
	);
	const [zipCode, setZipCode] = useState<string>(props.value?.zipCode ?? "");

	return (
		<div className={styles.wrapper}>
			<FormControl>
				<InputLabel id="country-select">Land</InputLabel>
				<Select
					className={styles.select}
					labelId="country-select"
					id="demo-simple-select"
					value={countryCode ?? undefined}
					onChange={(e, _) => updateCountryCode(e.target.value as string)}
				>
					<MenuItem value={NO_COUNTRY_CODE}>Keine Angabe</MenuItem>
					<MenuItem value="DE">🇩🇪 Deutschland</MenuItem>
					<MenuItem value="AT">🇦🇹 Österreich</MenuItem>{" "}
					{/* TODO: "Besseres Deutschland"? */}
					<MenuItem value="CH">🇨🇭 Schweiz</MenuItem>{" "}
					{/* TODO: Something that involves a certain religion? */}
				</Select>
			</FormControl>
			{countryCode !== NO_COUNTRY_CODE && ( // <Fade /> seems to throw randomly due to missing DOM nodes
				<TextField
					required
					label="Postleitzahl"
					inputMode="numeric"
					onChange={e => updateZipCode(e.target.value)}
					value={zipCode ?? ""}
					inputProps={{
						inputMode: "numeric",
						pattern: "^\\d{4,5}$",
					}}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<MapPinIcon />
							</InputAdornment>
						),
					}}
				/>
			)}
		</div>
	);

	function updateCountryCode(countryCode: string | typeof NO_COUNTRY_CODE) {
		setCountryCode(countryCode);

		setZipCode("");
		props.onChange(null);
	}

	function updateZipCode(zipCode: string) {
		setZipCode(zipCode);

		if (!isZipCode(zipCode)) {
			props.onChange(null);
			return;
		}

		if (isCountryCode(countryCode)) {
			props.onChange({
				countryCode,
				zipCode,
			} as unknown as GeoLocation);
		}
	}
}
