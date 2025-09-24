import * as React from "react";
import { useKeyPressEvent } from "react-use";

import type { LocationHintData } from "@/shared/api-types";

// import CardActions from "@mui/material/CardActions";
import { vibrationHint } from "../../util";
import type { PendingVote } from "../../api";

import VoteBar from "./VoteBar";

import styles from "./Voting.module.scss";
import VotingCard from "./VotingCard";

interface VotingProps {
	candidates: readonly PendingVote[];
	locationHintData: LocationHintData;
	vote(candidate: PendingVote, value: boolean): Promise<void>;
}

export default function Voting({ candidates, vote, locationHintData }: VotingProps) {
	const [decision, setDecision] = React.useState<undefined | true | false>(undefined);

	useKeyPressEvent("w", voteUp);
	useKeyPressEvent("s", voteDown);
	useKeyPressEvent("+", voteUp);
	useKeyPressEvent("-", voteDown);

	const currentCandidate = candidates[candidates.length - 1];

	function voteUp(e: React.MouseEvent<HTMLButtonElement> | KeyboardEvent) {
		blur(e);
		if (decision !== undefined) return;

		setDecision(true);
		vibrationHint();
		return vote(currentCandidate, true).then(() => setDecision(undefined));
	}

	function voteDown(e: React.MouseEvent<HTMLButtonElement> | KeyboardEvent) {
		blur(e);
		if (decision !== undefined) return;

		setDecision(false);
		return vote(currentCandidate, false).then(() => setDecision(undefined));
	}

	return (
		<>
			<div className={styles.voting}>
				<VotingCard
					candidate={currentCandidate}
					locationHintData={locationHintData}
					decision={decision}
				/>
			</div>
			<VoteBar voteUp={voteUp} voteDown={voteDown} disabled={decision !== undefined} />
		</>
	);
}

function blur(e: React.MouseEvent<HTMLButtonElement> | KeyboardEvent) {
	const eTarget = e?.target;
	if (eTarget && typeof (eTarget as HTMLButtonElement).blur === "function") {
		(eTarget as HTMLButtonElement).blur();
	}
}
