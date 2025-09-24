import T from "@mui/material/Typography";

import { CenteredLoadingBar } from "@/component/Loading";
import CardEnumeration from "@/component/CardEnumeration";
import PageContent from "@/component/PageContent";
import VoteCard from "@/component/VoteCard";

import type { LoggedInBaseProps } from "../../types";

import "./Votes.scss";
import useApi from "@/hooks/useApi";

export default function VotesPage(props: LoggedInBaseProps) {
	const res = useApi("/vote", props.session);

	if (res.error) {
		return <h1>1 Fehler :(</h1>;
	}

	if (!res.data) {
		return <CenteredLoadingBar />;
	}

	return res.data.length === 0 ? (
		<PageContent alignItems="center" variant="center">
			<T variant="h4">Du hast noch keine Votes.</T>
		</PageContent>
	) : (
		<PageContent>
			<CardEnumeration>
				{res.data.map(v => (
					<VoteCard key={v.partnerId} vote={v} session={props.session} />
				))}
			</CardEnumeration>
		</PageContent>
	);
}
