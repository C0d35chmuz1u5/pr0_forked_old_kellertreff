import { type Dispatch, useState } from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import Switch from "@mui/material/Switch";

import { DEV } from "../../client-constants";
import { apiFetch } from "../../api";
import type { KTSession, LoggedInBaseProps } from "../../types";

import styles from "./NotificationPreferences.module.scss";

import { NotificationIcon } from "@/icons";

export interface NotificationPreferencesProps extends LoggedInBaseProps {
	initialWantsNotifications: boolean;
	annoyUser?: boolean;
}

export default function NotificationPreferencesS(props: NotificationPreferencesProps) {
	const [wantsNotificationsState, setWantsNotificationState] = useState<undefined | boolean>(
		undefined,
	);

	const wantsNotifications = wantsNotificationsState ?? props.initialWantsNotifications;

	function save(newValue: boolean) {
		if (typeof newValue !== "boolean") {
			DEV && console.assert(false);
			return;
		}

		const oldValue = wantsNotifications;

		setWantsNotificationState(newValue);
		saveNotificationPreferences(props.session, newValue)
			.then(r => setWantsNotificationState(r?.data?.wantsNotifications ?? oldValue))
			.catch(_ => setWantsNotificationState(oldValue));
	}

	return (
		<NotificationPreferencesControl
			{...props}
			setWantsNotification={save}
			wantsNotifications={wantsNotifications}
		/>
	);
}

export function saveNotificationPreferences(session: KTSession, value: boolean) {
	return apiFetch("/account/notification-preferences", session, {
		method: "PATCH",
		body: {
			wantsNotifications: value,
		},
	}).then(r => r.json());
}

export interface NotificationPreferencesControlProps extends LoggedInBaseProps {
	wantsNotifications: boolean;
	setWantsNotification: Dispatch<boolean>;
	annoyUser?: boolean;
}

export function NotificationPreferencesControl(props: NotificationPreferencesControlProps) {
	return (
		<>
			<Typography
				className={props.wantsNotifications || !props.annoyUser ? "" : styles.rainbow}
				variant="h6"
				component="h2"
			>
				<NotificationIcon size={20} /> Benachrichtigungen
			</Typography>

			<Typography variant="body2" gutterBottom>
				Bei einem Match erhältst Du immer eine private Nachricht auf pr0gramm.com.
			</Typography>

			<FormControlLabel
				control={
					<Switch
						checked={props.wantsNotifications}
						onChange={(_, newValue) => props.setWantsNotification(newValue)}
					/>
				}
				label="Zusätzliche Benachrichtigungen"
			/>

			<Typography
				variant="body2"
				color="textSecondary"
				className={styles.description}
				gutterBottom
			>
				z. B. bei erhaltenen Blussis.
			</Typography>
		</>
	);
}
