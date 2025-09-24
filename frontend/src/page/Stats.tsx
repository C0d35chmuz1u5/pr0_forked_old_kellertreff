import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import T from "@mui/material/Typography";

import useApi from "@/hooks/useApi";
import { CenteredLoadingBar } from "@/component/Loading";
import { CustomTimeAgo } from "@/component/CustomTimeAgo";
import { StatCard } from "@/component/StatsGadget";
import CardFooter from "@/component/CardFooter";
import type { Stats } from "@/shared/api-types";
import type { CountryCode } from "@/shared/typebox";
import type { KTSession } from "@/types";

import "./Stats.scss";

export interface StatsPageProps {
	session: KTSession;
}

export default function StatsPage(props: StatsPageProps) {
	const res = useApi("/admin/stats", props.session);

	if (res.error) {
		// <ApiError error={res} />;}
		return <h1>1 Fehler :(</h1>;
	}
	if (!res.data) {
		return <CenteredLoadingBar />;
	}
	const d = res.data;

	const voteRatio = getRatio(d.votesOfToday.up, d.votesOfToday.down);
	// const matchRatio = getRatio(d.votesOfToday.up, d.votesOfToday.down);

	// Idea: Average Thor number

	return (
		<div className="container stats">
			<h1>Statistiken</h1>
			<p>
				Die letzte Registrierung war{" "}
				<CustomTimeAgo date={d.lastRegistration} component="span" tooltip />.
				<br />
				Der letzte Vote war <CustomTimeAgo date={d.lastVote} component="span" tooltip />.
			</p>
			<div className="stats-row">
				<StatCard value={d.users}>User</StatCard>
				<StatCard value={d.completeProfiles}>Vollständige Profile</StatCard>
				<StatCard value={d.totalVotes}>Verteilte Votes</StatCard>
				<StatCard value={d.totalMatches}>Matches</StatCard>
			</div>
			<div className="stats-row">
				<StatCard value={d.sentNotifications}>Versendete PNs</StatCard>
				<StatCard value={d.notificationsPending}>Ausstehende PNs</StatCard>
				<StatCard value={d.usersWithNotificationsEnabled}>
					Nutzer mit Benachrichtigungen
				</StatCard>
			</div>
			<div className="stats-row">
				<GeoStats countryStats={d.countryStats} />
			</div>

			<h2>Heute</h2>
			<div className="stats-row">
				<StatCard value={d.votesOfToday.up}>Upvotes</StatCard>
				<StatCard value={d.votesOfToday.down}>Downvotes</StatCard>
				<StatCard value={voteRatio}>Up/Down-Verhältnis</StatCard>
			</div>
		</div>
	);
}

function GeoStats(props: { countryStats: Stats["countryStats"] }) {
	return (
		<Card>
			<CardContent>
				<T variant="h5" component="h2">
					{props.countryStats.map(cs => (
						<div key={cs.countryCode}>
							{getFlagEmoji(cs.countryCode)} {cs.users}
						</div>
					))}
				</T>
			</CardContent>
			<CardFooter>
				<T variant="subtitle1" color="textSecondary">
					User mit Geolocation
				</T>
			</CardFooter>
		</Card>
	);
}

function getFlagEmoji(countryCode: CountryCode): string {
	const codePoints = countryCode
		.toUpperCase()
		.split("")
		.map(char => char.charCodeAt(0) - 0x41 /* offset for asciis */ + 0x1f1e6 /* flag offset */);
	return String.fromCodePoint(...codePoints);
}

function getRatio(a: number, b: number): string | number {
	return b === 0 ? "∞" : Math.round((a / b) * 100) / 100;
}
