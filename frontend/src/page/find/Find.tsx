import * as React from "react";

import { CenteredLoadingBar } from "@/component/Loading";

import PageContent from "@/component/PageContent";

import useApi from "@/hooks/useApi";
import { VOTE_DELAY, VOTE_PRESENT_DELAY } from "../../client-constants";
import { useLocationHintData } from "../../hooks";
import type { LoggedInBaseProps, KTSession } from "../../types";
import {
	apiFetch,
	type PendingVote,
	type ServerResponse,
	type VoteResult,
	type MatchedVote,
} from "../../api";

import { DEV } from "../../client-constants";
import Voting from "./Voting";
import GotMatchCard from "./GotMatchCard";
import NoPendingVotes from "./NoPendingVotes";

import "./Find.scss";

export default function Find({ session }: LoggedInBaseProps) {
	const [pendingVotesState, setPendingVotesState] = React.useState<PendingVote[] | undefined>(
		undefined,
	);
	const [currentMatch, setCurrentMatch] = React.useState<undefined | MatchedVote>(undefined);

	React.useEffect(() => {
		document.body.style.setProperty("--vote-submit-animation-duration", VOTE_DELAY + "ms");
		document.body.style.setProperty(
			"--vote-present-animation-duration",
			VOTE_PRESENT_DELAY + "ms",
		);
	}, []);

	/*
	{
		matchedAt: new Date().toString(),
		partnerId: 213 as import("@/shared/types").UserId,
		partnerName: "Gamb" as import("@/shared/types").UserName,
		partnerText: "lutsch mir einen" as import("@/shared/types").UserText,
		partnerTags: ["b", "a", "c"] as import("@/shared/types").Tag[],
	}
	*/

	const res = useApi("/vote/pending", session);
	const locationHintData = useLocationHintData();

	if (!res.data) {
		return <CenteredLoadingBar />;
	}

	if (res.error) {
		return <h1>1 Fehler :(</h1>;
	}

	if (currentMatch) {
		return (
			<PageContent>
				<GotMatchCard newMatch={currentMatch} resumeVoting={resumeVoting} />
			</PageContent>
		);
	}

	const pendingVotes = pendingVotesState ?? res.data;

	if (pendingVotes.length === 0) {
		return (
			<PageContent>
				<NoPendingVotes />
			</PageContent>
		);
	}

	return (
		<PageContent>
			<Voting candidates={pendingVotes} locationHintData={locationHintData} vote={vote} />
		</PageContent>
	);

	function vote(candidate: PendingVote, value: boolean): Promise<void> {
		DEV && console.log(`Voting ${value} on ${candidate.userId}`);

		if (pendingVotes.length === 0) return Promise.resolve();

		DEV && console.assert(candidate);

		// We wait at least voteDelay seconds before we show the next candidate
		// This is because we can show the vote animation (and build tension if it was a match)
		return Promise.all([submitVoteForCandidate(session, candidate, value), delay(VOTE_DELAY)])
			.then(([matchResult]) => {
				const newCurrentMatch =
					matchResult.success && !!matchResult.data ? matchResult.data : undefined;

				setCurrentMatch(newCurrentMatch);
				updateVoteIndex(candidate);
			})
			.catch(() => {
				resumeVoting();
				updateVoteIndex(candidate);
			});
	}

	function updateVoteIndex(lastVotedOnUser: PendingVote) {
		setPendingVotesState(pendingVotes.filter(p => p !== lastVotedOnUser));
	}

	function resumeVoting() {
		setCurrentMatch(undefined);
	}
}

function submitVoteForCandidate(session: KTSession, candidate: PendingVote, vote: boolean) {
	return apiFetch("/vote", session, {
		method: "PUT",
		body: {
			partnerId: candidate.userId,
			vote,
		},
	}).then(r => r.json()) as Promise<ServerResponse<VoteResult>>;
}

function delay(ms: number): Promise<void> {
	return new Promise(res => setTimeout(res, ms));
}
