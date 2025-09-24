import { Fireworks } from "fireworks/lib/react";
import Button from "@mui/material/Button";
import T from "@mui/material/Typography";

import type { MatchedVote } from "@/shared/api-types";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

import { ConversationIcon, LikeIcon } from "@/icons";
import { getMessageHref, UserProfileLink } from "@/component/UserLink";
import CardFooter from "@/component/CardFooter";

export interface GotMatchCardProps {
	newMatch: MatchedVote;
	resumeVoting: () => void;
}

const fireworkConfig = {
	count: 1,
	interval: 0,
	colors: ["#ee4d2e", "#ff0000", "#ddd"],
	calc: (props: Record<string, unknown>, i: number) => ({
		...props,
		x: (i + 1) * (window.innerWidth / 2) - (i + 1),
		y: 250 + Math.random() * 100 - 50 + (i === 2 ? -80 : 0),
	}),
	bubbleSpeedMinimum: 5,
	bubbleSpeedMaximum: 8,
	canvasWidth: 350,
	canvasHeight: 350,
};

export default function GotMatchCard(props: GotMatchCardProps) {
	return (
		<Card>
			<CardContent>
				<Fireworks {...fireworkConfig} />
				<T component="h2" variant="h4" gutterBottom>
					Match!
				</T>
				<T gutterBottom>
					Du hast einen Match mit{" "}
					<UserProfileLink userName={props.newMatch.partnerName} showTooltips={true} />.
				</T>
				<T>
					Ihr werdet beide auf pr0gramm mit einer privaten Nachricht über Euren Match
					informiert.
				</T>
				<T>
					Du kannst jetzt den ersten Schritt wagen und {props.newMatch.partnerName}{" "}
					anschreiben!
				</T>
			</CardContent>

			<CardFooter variant="space-between">
				<Button
					variant="text"
					size="large"
					color="primary"
					startIcon={<ConversationIcon />}
					component={"a"}
					href={getMessageHref(props.newMatch.partnerName)}
					target="_blank"
					rel="noopener noreferrer"
				>
					{props.newMatch.partnerName} anschreiben
				</Button>
				<T variant="h6">oder</T>
				<Button
					variant="text"
					size="large"
					color="primary"
					onClick={props.resumeVoting}
					startIcon={<LikeIcon />}
				>
					Weiter voten
				</Button>
			</CardFooter>
		</Card>
	);
}
