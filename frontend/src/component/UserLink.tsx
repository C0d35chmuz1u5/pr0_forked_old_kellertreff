import Link from "@mui/material/Link";
import { IconButton, Tooltip } from "@mui/material";
import { ConversationIcon, UserIcon } from "@/icons";

import type { UserName } from "@/shared/typebox";

type UserLinkProps = {
	userName: UserName;
	showTooltips: boolean;
};
export function UserProfileLink(props: UserLinkProps) {
	return (
		<Link
			href={getProfileHref(props.userName)}
			rel="noopener noreferrer"
			target="_blank"
			underline="hover"
		>
			{props.userName}
		</Link>
	);
}
export function UserProfileLinkIcon(props: UserLinkProps) {
	const button = (
		<IconButton
			href={getProfileHref(props.userName)}
			rel="noopener noreferrer"
			target="_blank"
			size="large"
		>
			<UserIcon />
		</IconButton>
	);

	return props.showTooltips ? (
		<Tooltip title={`Profil von ${props.userName}`} placement="top" arrow>
			{button}
		</Tooltip>
	) : (
		button
	);
}

function getProfileHref(userName: UserName) {
	return `https://pr0gramm.com/user/${encodeURIComponent(userName)}`;
}

type MessageLinkProps = {
	userName: UserName;
	text?: string;
	showTooltips: boolean;
};
export function UserMessageLink(props: MessageLinkProps) {
	return (
		<Link
			href={getMessageHref(props.userName)}
			rel="noopener noreferrer"
			target="_blank"
			underline="hover"
		>
			{props.text ?? props.userName}
		</Link>
	);
}
export function UserMessageLinkIcon(props: MessageLinkProps) {
	const button = (
		<IconButton
			href={getMessageHref(props.userName)}
			rel="noopener noreferrer"
			target="_blank"
			component="a"
			size="large"
		>
			<ConversationIcon />
		</IconButton>
	);

	return props.showTooltips ? (
		<Tooltip title={`${props.userName} anschreiben`} placement="top" arrow>
			{button}
		</Tooltip>
	) : (
		button
	);
}

export function getMessageHref(userName: UserName) {
	return `https://pr0gramm.com/inbox/messages/${encodeURIComponent(userName)}`;
}
