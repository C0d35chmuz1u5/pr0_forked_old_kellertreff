import T from "@mui/material/Typography";

import { CenteredLoadingBar } from "@/component/Loading";
import CardEnumeration from "@/component/CardEnumeration";
import PageContent from "@/component/PageContent";
import MatchCard from "@/component/MatchCard";
import useApi from "@/hooks/useApi";
import useIsPhoneLayout from "@/hooks/useIsPhoneLayout";

import type { LoggedInBaseProps } from "../../types";

import "./Matches.scss";

export default function MatchesPage(props: LoggedInBaseProps) {
	const isMobile = useIsPhoneLayout();
	const res = useApi("/vote/match", props.session);

	if (res.error) {
		// <ApiError error={res} />;}
		return <h1>1 Fehler :(</h1>;
	}
	if (!res.data) {
		return <CenteredLoadingBar />;
	}

	return res.data.length === 0 ? (
		<PageContent alignItems="center" variant="center">
			<T variant="h4">Du hast noch keine Matches.</T>
		</PageContent>
	) : (
		<PageContent>
			<CardEnumeration>
				{res.data.map(m => (
					<MatchCard key={m.partnerId} match={m} showTooltips={!isMobile} />
				))}
			</CardEnumeration>
		</PageContent>
	);
}
