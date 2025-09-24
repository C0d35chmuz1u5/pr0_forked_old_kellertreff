/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: Remove this ^

import { useState } from "react";
import { Link, Navigate } from "react-router-dom";

import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Snackbar from "@mui/material/Snackbar";
import Fade from "@mui/material/Fade";
import Modal from "@mui/material/Modal";
import Backdrop from "@mui/material/Backdrop";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import T from "@mui/material/Typography";
import ButtonGroup from "@mui/material/ButtonGroup";
import MuiLink from "@mui/material/Link";

import PageContent from "@/component/PageContent";
import CardFooter from "@/component/CardFooter";
import CardEnumeration from "@/component/CardEnumeration";
import { CenteredLoadingBar } from "@/component/Loading";

import { DeleteIcon, PinIcon, LogOutIcon } from "@/icons";
import type { SettingsResponse } from "@/shared/api-types";
import { APP_NAME } from "@/shared/constants";
import type { LoggedInBaseProps, KTSession } from "../../types";
import { apiFetch } from "../../api";

import NotificationPreferences from "./NotificationPreferences";
import { usePromptToInstall } from "./PromptToInstallProvider";
import useApi from "@/hooks/useApi";

type SettingsPageProps = LoggedInBaseProps & {
	initialData: SettingsResponse;
};

export default function Settings(props: LoggedInBaseProps) {
	const res = useApi("/account/settings", props.session);
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
		<SettingsPage session={props.session} initialData={data} />
	);
}

function SettingsPage(props: SettingsPageProps) {
	const { deferredEvt, hidePrompt } = usePromptToInstall();
	const [showDeleteAccountConfirmation, setShowDeleteAccountConfirmation] = useState(false);

	return (
		<PageContent>
			<CardEnumeration>
				<Card>
					<CardContent>
						<NotificationPreferences
							session={props.session}
							initialWantsNotifications={props.initialData.wantsNotifications}
							annoyUser
						/>
					</CardContent>
				</Card>
				<Card>
					<CardContent>
						<T variant="h6" component="h2">
							{" "}
							Abmelden
						</T>
						<T variant="body2">
							Du kannst Dich jederzeit wieder mit Deinem pr0gramm-Account einloggen.
						</T>
					</CardContent>
					<CardFooter variant="flex-end">
						<Button
							color="secondary"
							onClick={props.session.logOut}
							startIcon={<LogOutIcon />}
						>
							Ausloggen
						</Button>
					</CardFooter>
				</Card>
				<Card>
					<CardContent>
						<T variant="h6" component="h2">
							Account löschen
						</T>
						<T variant="body2">
							Dein Account auf pr0gramm.com sowie Deine privaten Nachrichten dort
							bleiben von Deiner Accountlöschung unberührt. Es werden{" "}
							<b>nur Deine Daten, die auf {APP_NAME} gespeichert sind</b>, gelöscht.
						</T>
					</CardContent>
					<CardFooter variant="flex-end">
						<Button
							color="secondary"
							onClick={() => setShowDeleteAccountConfirmation(true)}
							startIcon={<DeleteIcon />}
						>
							Account löschen
						</Button>
						<DeleteAccountModal
							session={props.session}
							open={showDeleteAccountConfirmation}
							setOpen={setShowDeleteAccountConfirmation}
						/>
					</CardFooter>
				</Card>
				{deferredEvt && false && (
					/* TODO */ <Card>
						<CardContent>
							<T variant="h6" component="h2">
								{" "}
								App
							</T>
							<T variant="body2">
								Du kannst Kellertreff auf deinen Homescreen pinnen. Sieht dann fast
								aus wie eine App. 🤯
							</T>
						</CardContent>
						<CardFooter variant="flex-end">
							<ButtonGroup color="secondary">
								<Button onClick={hidePrompt}>Nerv" nicht</Button>
								<Button
									// biome-ignore lint/style/noNonNullAssertion: <explanation>
									onClick={deferredEvt!.prompt}
									startIcon={<PinIcon />}
								>
									Als App pinnen
								</Button>
							</ButtonGroup>
						</CardFooter>
					</Card>
				)}

				<MuiLink component={Link} to="/contact" underline="hover">
					Kontakt
				</MuiLink>
				{props.session.info.id === 1 && (
					<>
						<MuiLink component={Link} to="/stats" underline="hover">
							Statistiken
						</MuiLink>
						<MuiLink component={Link} to="/_dev" underline="hover">
							Dev
						</MuiLink>
					</>
				)}
			</CardEnumeration>
		</PageContent>
	);
}

function DeleteAccountModal(props: {
	session: KTSession;
	open: boolean;
	setOpen: (v: boolean) => void;
}) {
	const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

	function deleteAccountHandler() {
		deleteAccount(props.session).then(() => {
			setShowDeleteConfirmation(true);
			props.setOpen(false);
			setTimeout(() => {
				setShowDeleteConfirmation(false);
				props.session.logOut();
			}, 3000);
		});
	}

	return (
		<>
			<Modal
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
				}}
				aria-labelledby="delete-account-modal-title"
				open={props.open}
				onClose={() => props.setOpen(false)}
				closeAfterTransition
				BackdropComponent={Backdrop}
				BackdropProps={{
					timeout: 500,
				}}
			>
				<Fade in={props.open}>
					<Card>
						<CardContent>
							<T variant="h6" gutterBottom id="delete-account-modal-title">
								Möchtest du deinen Kellertreff-Account wirklich löschen? 😢
							</T>
							<T gutterBottom>Das kann nicht rückgängig gemacht werden.</T>
							<T gutterBottom>
								Du kannst aber jeder Zeit wieder einen neuen Account anlegen.
							</T>
						</CardContent>
						<CardFooter variant="space-between">
							<Button
								color="primary"
								variant="outlined"
								onClick={() => props.setOpen(false)}
							>
								Nee, doch nicht
							</Button>
							<Button
								color="primary"
								variant="outlined"
								onClick={deleteAccountHandler}
							>
								Ja man, Account löschen
							</Button>
						</CardFooter>
					</Card>
				</Fade>
			</Modal>

			<Snackbar
				open={showDeleteConfirmation}
				anchorOrigin={{ vertical: "top", horizontal: "center" }}
			>
				<Alert severity="info" elevation={6} variant="filled">
					<AlertTitle>Account gelöscht</AlertTitle>
					Mach's gut! 👋
				</Alert>
			</Snackbar>
		</>
	);
}

export function deleteAccount(session: KTSession) {
	return apiFetch("/account/profile", session, {
		method: "DELETE",
		body: {
			userName: session.info.displayName,
		},
	});
}
