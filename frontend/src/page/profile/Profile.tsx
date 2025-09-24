import { useState } from "react";
import { Navigate } from "react-router-dom";
import { TextLoop } from "@pr0gramm/react-text-loop";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import T from "@mui/material/Typography";
import MuiAlert, { type AlertProps, type AlertColor } from "@mui/material/Alert";

import { CenteredLoadingBar } from "@/component/Loading";
import UserTextInput from "@/component/UserTextInput";
import GeoLocationInput from "@/component/GeoLocationInput";
import TagOrderEditor from "@/component/TagOrderEditor";
import CardFooter from "@/component/CardFooter";
import CardEnumeration from "@/component/CardEnumeration";
import PageContent from "@/component/PageContent";

import { TagIcon, AlignLeftIcon, SaveIcon, MapIcon } from "@/icons";

import { assertGeoLocation } from "@/shared/types";
import type { ProfileInfo } from "@/shared/api-types";
import type { LoggedInBaseProps } from "../../types";
import type { GeoLocation, UserTagSet } from "@/shared/typebox";
import { MAX_TAG_COUNT, MIN_TAG_COUNT } from "@/shared/constants";

import { DEV } from "../../client-constants";
import { apiFetch, isUserText, assertTags, assertUserText } from "../../api";
import useApi from "@/hooks/useApi";

export default function Profile(props: LoggedInBaseProps) {
	const res = useApi("/account/profile", props.session);

	if (res.error) {
		// <ApiError error={res} />;}
		return <h1>1 Fehler :(</h1>;
	}
	if (!res.data) {
		return <CenteredLoadingBar />;
	}

	const data = res.data;
	return data.mustCompleteProfile ? (
		<Navigate replace to="/setup" />
	) : (
		<ProfilePage session={props.session} initialData={data} />
	);
}

// TODO: Limit edits per day so we can mitigate triangulation by zip codes

const tagHints = [
	"Tagge die Stadt oder einen Ort.",
	'Wenn du schwul bist, tagge "mod".',
	"Tagge mehr als 2 Sachen.",
	"Ananas auf Pizza ist essbar.",
	"Lese diese Tipps.",
];

type ProfilePageProps = LoggedInBaseProps & {
	initialData: ProfileInfo;
};

function ProfilePage(props: ProfilePageProps) {
	const [currentTags, setCurrentTags] = useState<UserTagSet>([
		...props.initialData.tags,
	] as UserTagSet);
	const [currentText, setCurrentText] = useState<string>(props.initialData.currentText ?? "");
	const [currentLocation, setCurrentLocation] = useState<GeoLocation | null>(
		props.initialData.location ?? null,
	);
	const [notificationState, setNotificationState] = useState<{
		text?: string;
		severity: AlertColor | undefined;
	}>({ severity: undefined });

	const invalidProfileReason = getInvalidProfileReason(currentText, currentTags);
	const tagsUsedUp = currentTags.length >= MAX_TAG_COUNT;
	const hasRequiredTags = currentTags.length >= MIN_TAG_COUNT;

	// TODO: Refactor this to a form?
	return (
		<PageContent>
			<CardEnumeration>
				<Card>
					<CardContent>
						<T variant="h5" component="h2" gutterBottom>
							<TagIcon size={20} /> Deine Tags
						</T>
						<div
							style={{
								display: "flex",
								gap: "10px",
								flexDirection: "column",
							}}
						>
							<TagOrderEditor tags={currentTags} setTags={setCurrentTags} />
							{tagsUsedUp && (
								<T gutterBottom>Du kannst maximal {MAX_TAG_COUNT} Tags angeben.</T>
							)}
							{!hasRequiredTags && (
								<T gutterBottom>
									Du benötigst mindestens {MIN_TAG_COUNT} Tags, um fortzufahren.
								</T>
							)}
						</div>
					</CardContent>

					<CardFooter>
						<T color="textSecondary" gutterBottom>
							Tipp: <TextLoop interval={8000}>{tagHints}</TextLoop>
						</T>
					</CardFooter>
				</Card>
				<Card>
					<CardContent>
						<label htmlFor="userText">
							<T variant="h5" component="h2">
								<AlignLeftIcon size={20} /> Dein Text
							</T>
							<T gutterBottom>
								Beschreibe Dich oder was Du suchst.{" "}
								{/* Denk dran: Jemand anderes muss das lesen. */}
							</T>
							<UserTextInput
								id="userText"
								currentText={currentText}
								setCurrentText={setCurrentText}
							/>
						</label>
					</CardContent>
				</Card>
				<Card>
					<CardContent>
						<T variant="h5" component="h2" gutterBottom>
							<MapIcon size={20} /> Dein Ort
						</T>
						<T gutterBottom>
							Wird niemandem direkt angezeigt und nur für die Entfernungsbestimmung
							verwendet. Optional.
						</T>

						<GeoLocationInput value={currentLocation} onChange={setCurrentLocation} />
					</CardContent>
				</Card>

				<CardFooter variant="center">
					<Button
						variant="contained"
						color="primary"
						size="large"
						title={invalidProfileReason}
						disabled={!!invalidProfileReason}
						onClick={save}
						startIcon={<SaveIcon />}
					>
						Speichern
					</Button>
				</CardFooter>
			</CardEnumeration>

			<Snackbar
				anchorOrigin={{ vertical: "top", horizontal: "center" }}
				open={notificationState?.severity !== undefined}
				autoHideDuration={5000}
				onClose={handleNotificationClose}
			>
				<Alert onClose={handleNotificationClose} severity={notificationState?.severity}>
					{notificationState?.text}
				</Alert>
			</Snackbar>
		</PageContent>
	);

	function save() {
		DEV && assertUserText(currentText);
		DEV && assertTags(currentTags);
		DEV && (currentLocation === null || assertGeoLocation(currentLocation));

		apiFetch("/account/profile", props.session, {
			method: "PATCH",
			body: {
				currentText,
				currentTags,
				location: currentLocation,
			},
		})
			.then(() =>
				setNotificationState({
					text: "Dein Profil wurde erfolgreich gespeichert! ☺️",
					severity: "success",
				}),
			)
			.catch(() =>
				setNotificationState({
					text: "Dein Profil konnte nicht gespeichert werden 😭",
					severity: "error",
				}),
			);
	}

	function handleNotificationClose() {
		setNotificationState({ ...notificationState, severity: undefined });
	}
}

function Alert(props: AlertProps) {
	return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function getInvalidProfileReason(currentText: string, tags: UserTagSet): string | undefined {
	if (tags.length === 0) return "Bitte gebe mindestens einen Tag an";
	if (!isUserText(currentText)) return "Bitte gebe einen Text an";
	if (tags.length < MIN_TAG_COUNT) return `Du musst mindestens ${MIN_TAG_COUNT} Tags angeben`;
	return undefined;
}
