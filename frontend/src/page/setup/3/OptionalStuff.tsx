import type { Dispatch, SetStateAction } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import T from "@mui/material/Typography";

import { MapIcon } from "@/icons";
import type { GeoLocation } from "@/shared/typebox";
import GeoLocationInput from "@/component/GeoLocationInput";
import CardEnumeration from "@/component/CardEnumeration";
import { NotificationPreferencesControl } from "@/page/settings/NotificationPreferences";

import type { StepProps } from "../common";
import StepProgress from "../StepProgress";
import StageContent from "../StageContent";

export type OptionalStuffProps = StepProps & {
	extendedNotifications: boolean;
	setExtendedNotifications: Dispatch<boolean>;
	currentLocation: GeoLocation | null;
	setCurrentLocation: Dispatch<SetStateAction<GeoLocation | null>>;
};

export default function OptionalStuff(props: OptionalStuffProps) {
	console.assert(props.hasPrevStep);
	console.assert(props.hasNextStep);

	return (
		<>
			<StageContent>
				<T variant="h5" component="h2" gutterBottom>
					Da gibt es noch...
				</T>

				<CardEnumeration>
					<Card>
						<CardContent>
							<T variant="h5" component="h2" gutterBottom>
								<MapIcon size={20} /> Deinen Ort
							</T>
							<T gutterBottom>
								Wird niemandem direkt angezeigt und nur für die
								Entfernungsbestimmung verwendet. Optional.
							</T>

							<GeoLocationInput
								value={props.currentLocation}
								onChange={props.setCurrentLocation}
							/>
						</CardContent>
					</Card>

					<Card>
						<CardContent>
							<NotificationPreferencesControl
								session={props.session}
								wantsNotifications={props.extendedNotifications}
								setWantsNotification={props.setExtendedNotifications}
							/>
						</CardContent>
					</Card>
				</CardEnumeration>
			</StageContent>
			<StepProgress {...props} canPrev canNext />
		</>
	);
}
