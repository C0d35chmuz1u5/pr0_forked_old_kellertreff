import { useState } from "react";

import T from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import { CustomTimeAgo } from "@/component/CustomTimeAgo";
import TagListView from "@/component/TagListView";
import UserTextView from "@/component/UserTextView";
import { /* FlagIcon, */ VerticalDotsIcon, PlusCircleIcon } from "@/icons";

import type { KTSession } from "../types";
import { apiFetch, type VoteOfUser, type ServerResponse, type VoteResult } from "../api";

import CardFooter from "./CardFooter";
import styles from "./VoteCard.module.scss";

export type VoteViewProps = {
	session: KTSession;
	vote: VoteOfUser;
};

export default function VoteView({ session, vote }: VoteViewProps) {
	const [optionsAnchorElement, setOptionsAnchorElement] = useState<HTMLElement | null>(null);
	const decisionClass = vote.decision ? styles.up : styles.down;

	// TODO: Fix icon spacing

	return (
		<Card className={styles.card + " " + decisionClass}>
			<CardHeader
				action={
					!vote.decision && (
						<>
							<IconButton
								aria-label="settings"
								onClick={e => setOptionsAnchorElement(e.currentTarget)}
								size="large"
							>
								<VerticalDotsIcon />
							</IconButton>
							<Menu
								anchorEl={optionsAnchorElement}
								keepMounted
								open={!!optionsAnchorElement}
								onClose={() => setOptionsAnchorElement(null)}
							>
								{!vote.decision && (
									<MenuItem onClick={() => changeDecision(session, vote)}>
										<PlusCircleIcon size={20} /> Doch + geben
									</MenuItem>
								)}
								{/*
							TODO
							<MenuItem onClick={() => alert("TODO Lol das geht noch nicht")}>
								<FlagIcon size={20} /> Melden
							</MenuItem>
							*/}
							</Menu>
						</>
					)
				}
				title={<TagListView tags={vote.tags} />}
			/>

			<CardContent style={{ paddingTop: 0 }}>
				<UserTextView text={vote.text} />
			</CardContent>

			<CardFooter variant="flex-end">
				<CustomTimeAgo
					date={vote.votedAt}
					component={T}
					variant="overline"
					color="textSecondary"
					tooltip
				/>
			</CardFooter>
		</Card>
	);
}

function changeDecision(session: KTSession, vote: VoteOfUser) {
	// TODO: Change state instead of reloading and a crappy alert()
	patchDecision(session, vote).then(result => {
		if (result.success && result.data !== null) {
			const m = result.data;
			alert(
				`Du hast einen Match mit ${m.partnerName}! Schau" doch gleich in Deiner Match-Liste nach.`,
			);
		}
		window.location.reload();
	});
}

// TODO: Display something if the changed vote was a match
// TODO: Make this prettier
function patchDecision(session: KTSession, vote: VoteOfUser) {
	return apiFetch("/vote", session, {
		method: "PATCH",
		body: {
			partnerId: vote.partnerId,
			newDecision: !vote.decision,
		},
	}).then(r => r.json()) as Promise<ServerResponse<VoteResult>>;
}
