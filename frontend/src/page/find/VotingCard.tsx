// import { useState } from "react";

import T from "@mui/material/Typography";
// import Menu from "@mui/material/Menu";
// import MenuItem from "@mui/material/MenuItem";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
// import IconButton from "@mui/material/IconButton";
import CardContent from "@mui/material/CardContent";

// import { FlagIcon, VerticalDotsIcon } from "@/icons";

import { MapPinIcon } from "@/icons";
import TagListView from "@/component/TagListView";
import UserTextView from "@/component/UserTextView";
import type { LocationHintData, PendingVote } from "@/shared/api-types";
// import CardFooter from "@/component/CardFooter";

import styles from "./VotingCard.module.scss";

export interface VotingCardProps {
	candidate: PendingVote;
	locationHintData: LocationHintData;
	decision: boolean | undefined;
}
export default function VotingCard(props: VotingCardProps) {
	/*
		const [optionsAnchorElement, setOptionsAnchorElement] = useState<HTMLElement | null>(null);
		action={
			<>
				<IconButton aria-label="settings" onClick={e => setOptionsAnchorElement(e.currentTarget)}>
					<VerticalDotsIcon />
				</IconButton>
				<Menu
					anchorEl={optionsAnchorElement}
					keepMounted
					open={!!optionsAnchorElement}
					onClose={() => setOptionsAnchorElement(null)}
				>
					<MenuItem onClick={() => alert("TODO Lol das geht noch nicht")}>
						<FlagIcon size={20} /> Melden
					</MenuItem>
				</Menu>
			</>
		}
	*/
	return (
		<Card className={styles.card + " " + deriveClassNameFromDecision(props.decision)}>
			<CardHeader
				title={
					<div>
						{props.candidate.distance && (
							<T
								align="center"
								variant="overline"
								color="textSecondary"
								component="div"
								className={styles.distance}
							>
								<MapPinIcon size={16} />
								{props.candidate.distance}
							</T>
						)}
						<TagListView
							tags={props.candidate.tags}
							locationHintData={props.locationHintData}
						/>
					</div>
				}
			/>

			<CardContent style={{ paddingTop: 0 }}>
				<UserTextView text={props.candidate.currentText} />
			</CardContent>
		</Card>
	);
	/*
		<CardFooter variant="flex-end">
			<T variant="overline"></T>
		</CardFooter>
	*/
}

function deriveClassNameFromDecision(decision: boolean | undefined) {
	// TODO: Use pattern matching or some other kind of expression once it's available
	switch (decision) {
		case true:
			return styles.up;
		case false:
			return styles.down;
		default:
			return "";
	}
}
